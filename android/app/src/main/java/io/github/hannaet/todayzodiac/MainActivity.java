package io.github.hannaet.todayzodiac;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.OutputStream;

public class MainActivity extends Activity {
    static final String SITE = "https://hannaet-commits.github.io/today-zodiac/";
    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        webView.setBackgroundColor(0xFFFDE7F2);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUserAgentString(settings.getUserAgentString() + " TodayZodiacApp");
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.setDownloadListener(this::onDownload);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.loadUrl(SITE);
        setContentView(webView);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    void onDownload(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        if (url != null && url.startsWith("data:")) {
            saveDataUrl(url);
            return;
        }
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.addRequestHeader("User-Agent", userAgent);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(url, contentDisposition, mimeType)
            );
            DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            manager.enqueue(request);
            Toast.makeText(this, "다운로드를 시작했어 💗", Toast.LENGTH_SHORT).show();
        } catch (Exception error) {
            Toast.makeText(this, "다운로드에 실패했어", Toast.LENGTH_SHORT).show();
        }
    }

    void saveDataUrl(String url) {
        try {
            int comma = url.indexOf(',');
            if (comma < 0) {
                throw new IllegalArgumentException("bad data url");
            }
            byte[] bytes = Base64.decode(url.substring(comma + 1), Base64.DEFAULT);
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, "today-zodiac.png");
            values.put(MediaStore.MediaColumns.MIME_TYPE, "image/png");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            }
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                throw new IllegalStateException("no uri");
            }
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) {
                    throw new IllegalStateException("no stream");
                }
                out.write(bytes);
            }
            Toast.makeText(this, "저장했어 💗", Toast.LENGTH_SHORT).show();
        } catch (Exception error) {
            Toast.makeText(this, "저장에 실패했어", Toast.LENGTH_SHORT).show();
        }
    }
}
