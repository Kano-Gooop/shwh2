const app = getApp();

Page({
  data: {
    ip_id: 0,

    title: '',  // 版权名称（0元申请时有）
    company: '',  // 公司名称
    name: '',  // 姓名
    tel: '',  // 手机号
    code: '',  // 验证码
    email: '',  // 邮箱

    // 验证码相关
    code_text: '获取验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ip_id: parseInt(options.id)});
      wx.setNavigationBarTitle({title: 'IP授权'});
    } else {
      wx.setNavigationBarTitle({title: '0元申请IP'});
    }
  },
  // 发送验证码
  sendSms() {
    if (!this.data.code_disabled) {
      if (!this.data.tel.trim()) {
        app.toast('请填写手机号');
      } else if (!app.my_config.reg.tel.test(this.data.tel)) {
        app.toast('手机号格式不正确');
      } else {
        this.setData({ code_disabled: true });

        app.ajax('copyright/sendSms', { tel: this.data.tel }, () => {
          app.toast('已发送');
          this.setData({ code_text: this.data.count_down + 's' });
          this.data.code_flag = setInterval(() => {
            this.data.count_down--;
            if (this.data.count_down === 0) {
              this.data.count_down = 60;
              this.setData({
                code_text: '发送验证码',
                code_disabled: false
              });
              clearInterval(this.data.code_flag);
            } else {
              this.setData({ code_text: this.data.count_down + 's' });
            }
          }, 1000)
        }, (err) => {
          app.toast(err.message);
          this.setData({ code_disabled: false });
        });
      }
    }
  },
  // 表单提交
  ipApply() {
    let data = this.data;

    if (data.ip_id === 0 && !data.title.trim()) {
      app.toast('请填写版权名称');
    } else if (!data.company.trim()) {
      app.toast('请填写公司名称');
    } else if (!data.name.trim()) {
      app.toast('请填写姓名');
    } else if (!data.tel.trim()) {
      app.toast('请填写电话号码');
    } else if (!app.my_config.reg.tel.test(data.tel)) {
      app.toast('请填写正确的电话号码');
    } else if (!data.code.trim()) {
      app.toast('请填写验证码');
    } else if (!data.email.trim()) {
      app.toast('请填写邮箱');
    } else if (!app.my_config.reg.email.test(data.email)) {
      app.toast('请填写正确的邮箱');
    } else {

      let post = {
        company: data.company,
        name: data.name,
        tel: data.tel,
        code: data.code,
        email: data.email
      };

      let cmd;
      if (data.ip_id === 0) {
        post.title = data.title;
        cmd = 'copyright/ipFree';
      } else {
        post.ip_id = this.data.ip_id;
        cmd = 'copyright/ipApply';
      }

      wx.showLoading({
        title: '提交中',
        mask: true
      });
      app.ajax(cmd, post, () => {
        app.modal('提交成功！我们会尽快与您联系', () => {
          wx.navigateBack();
        });
      }, null, () => {
        wx.hideLoading();
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});