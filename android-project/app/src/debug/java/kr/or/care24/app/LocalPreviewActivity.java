package kr.or.care24.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.*;
import android.widget.*;

/** Android Studio preview of the deployed HTTPS app. This class is excluded from release builds. */
public class LocalPreviewActivity extends androidx.activity.ComponentActivity {
    private WebView web;
    private ValueCallback<Uri[]> pendingFiles;
    private static final String URL = "https://care.xn--24-ts1i486c.com/";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        web = new WebView(this);
        layout.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(layout);
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { if (web.canGoBack()) web.goBack(); else finish(); }
        });
        layout.setOnApplyWindowInsetsListener((v, insets) -> {
            androidx.core.view.WindowInsetsCompat compat = androidx.core.view.WindowInsetsCompat.toWindowInsetsCompat(insets, v);
            androidx.core.graphics.Insets bars = compat.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        WebView.setWebContentsDebuggingEnabled(true);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (request.isForMainFrame() && "https".equals(uri.getScheme()) &&
                    "care24-hospital-hub.samganid5197259555.chatgpt.site".equals(uri.getHost())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (android.content.ActivityNotFoundException ex) {
                        Toast.makeText(LocalPreviewActivity.this, "전국병원 화면을 열 브라우저가 필요합니다.", Toast.LENGTH_LONG).show();
                    }
                    return true;
                }
                return !("https".equals(uri.getScheme()) && "care.xn--24-ts1i486c.com".equals(uri.getHost()) && (uri.getPort() == -1 || uri.getPort() == 443));
            }
            @Override public void onPageFinished(WebView view, String url) {
                Log.i("Care24Preview", "Page loaded: " + Uri.parse(url).getPath());
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) Toast.makeText(LocalPreviewActivity.this,
                    "인터넷 연결을 확인한 뒤 다시 실행해 주세요.", Toast.LENGTH_LONG).show();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingFiles != null) pendingFiles.onReceiveValue(null);
                pendingFiles = callback;
                try { startActivityForResult(params.createIntent(), 24); }
                catch (android.content.ActivityNotFoundException ex) { pendingFiles.onReceiveValue(null); pendingFiles = null; }
                return true;
            }
        });

        web.loadUrl(URL);
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == 24 && pendingFiles != null) {
            pendingFiles.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            pendingFiles = null;
        }
    }
    @Override protected void onDestroy() {
        if (pendingFiles != null) pendingFiles.onReceiveValue(null);
        web.destroy();
        super.onDestroy();
    }
}
