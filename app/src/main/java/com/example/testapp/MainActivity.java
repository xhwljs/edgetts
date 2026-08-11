package com.example.testapp;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

/**
 * 启动 Activity：弹出注册码输入框，校验通过后进入测试首页。
 * 正确注册码：063021
 */
public class MainActivity extends AppCompatActivity {

    private static final String VALID_CODE = "063021";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        showRegistrationDialog();
    }

    private void showRegistrationDialog() {
        LayoutInflater inflater = LayoutInflater.from(this);
        View dialogView = inflater.inflate(R.layout.dialog_register, null);
        final EditText etCode = dialogView.findViewById(R.id.et_register_code);

        final AlertDialog dialog = new AlertDialog.Builder(this)
                .setTitle(R.string.register_title)
                .setView(dialogView)
                .setCancelable(false)
                .setPositiveButton(R.string.register_confirm, null) // 稍后覆盖，防止自动关闭
                .setNegativeButton(R.string.register_cancel, (d, which) -> finish())
                .create();

        dialog.setCanceledOnTouchOutside(false);
        dialog.show();

        // 覆盖确认按钮点击逻辑：校验失败时不关闭对话框
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String code = etCode.getText().toString().trim();
            if (VALID_CODE.equals(code)) {
                Toast.makeText(MainActivity.this, R.string.register_correct, Toast.LENGTH_SHORT).show();
                dialog.dismiss();
                startActivity(new Intent(MainActivity.this, HomeActivity.class));
                finish();
            } else {
                Toast.makeText(MainActivity.this, R.string.register_wrong, Toast.LENGTH_SHORT).show();
                etCode.setText("");
            }
        });
    }
}
