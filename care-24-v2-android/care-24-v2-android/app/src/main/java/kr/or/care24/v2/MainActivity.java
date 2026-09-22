package kr.or.care24.v2;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.browser.customtabs.CustomTabColorSchemeParams;
import androidx.browser.customtabs.CustomTabsIntent;

/** Uses the browser session so the hosted site's authentication remains intact. */
public final class MainActivity extends Activity {
    private TextView status;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ScrollView scroll = new ScrollView(this);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setGravity(Gravity.CENTER_HORIZONTAL);
        content.setPadding(dp(24), dp(32), dp(24), dp(32));
        scroll.setFillViewport(true);
        scroll.addView(content);
        setContentView(scroll);
        scroll.setOnApplyWindowInsetsListener((view, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        scroll.requestApplyInsets();
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.care24_logo);
        logo.setContentDescription(getString(R.string.app_name));
        content.addView(logo, new LinearLayout.LayoutParams(dp(88), dp(88)));
        TextView title = text(getString(R.string.app_name), 28);
        title.setTypeface(null, android.graphics.Typeface.BOLD);
        content.addView(title);
        content.addView(text(getString(R.string.subtitle), 18));
        addButton(content, R.string.open_home, "home");
        addButton(content, R.string.open_hospitals, "hospitals");
        addButton(content, R.string.open_admin, "admin");
        content.addView(text(getString(R.string.login_help), 16));
        status = text("", 16);
        status.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE);
        content.addView(status);
        // Open once per launch, never reopen automatically after Back or rotation.
        if (savedInstanceState == null) openSite("home");
    }

    private void addButton(LinearLayout content, int label, String route) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(17);
        button.setAllCaps(false);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.topMargin = dp(12);
        content.addView(button, params);
        button.setOnClickListener(view -> openSite(route));
    }

    private void openSite(String route) {
        // Routes originate only from the app's fixed buttons, not external Intent data.
        String path = "admin".equals(route) ? "admin" : "regional/index.html";
        Uri url = Uri.parse(getString(R.string.site_url)).buildUpon().encodedPath("/" + path)
                .fragment("admin".equals(route) ? null : "hospitals").build();
        status.setText("");
        try {
            CustomTabsIntent tab = new CustomTabsIntent.Builder()
                .setShowTitle(true)
                .setDefaultColorSchemeParams(new CustomTabColorSchemeParams.Builder()
                    .setToolbarColor(Color.WHITE).build())
                .setShareState(CustomTabsIntent.SHARE_STATE_OFF)
                .build();
            tab.launchUrl(this, url);
        } catch (ActivityNotFoundException noBrowser) {
            status.setText(R.string.no_browser);
        } catch (SecurityException blocked) {
            status.setText(R.string.browser_error);
        }
    }

    private TextView text(String value, int size) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(Color.rgb(35, 43, 48));
        view.setGravity(Gravity.CENTER);
        view.setPadding(0, dp(12), 0, dp(12));
        return view;
    }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
}
