const app = getApp()

Page({
  data: {
    my_uid: 0,

    note_id: 0,
    note: {},
    input_bottom: 0,

    // 点赞
    like: false,
    like_loading: false,

    // 收藏
    collect: false,
    collect_loading: false,

    focus: false,  // 是否关注
    focus_loading: false,

    comment_num: 0,  // 评论条数

    auth_id: 0,  // 作者id
    comment_list: [],  // 评论列表
    re_name: '我要评论...',  // 回复人昵称
    to_cid: 0,  // 回复评论id
    content: '',
    release_focus: false,

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad(options) {
    this.data.note_id = options.id;
  },
  onShow() {
    this.setData({ my_uid: app.user_data.uid });
    this.getNoteDetail();
    this.commentList();
  },
  getNoteDetail(callback) {
    let post = {
      token: app.user_data.token,
      note_id: this.data.note_id
    };

    app.ajax('note/getNoteDetail', post, (res) => {
      app.avatar_format(res);
      app.ago_format(res, 'create_time');
      app.format_img(res.pics);
      this.setData({
        like: res.ilike,
        focus: res.ifocus,
        collect: res.icollect,
        note: res
      });
      if (callback) {
        callback();
      }
    });
  },
  bind_focus(e) {
    this.setData({
      input_bottom: e.detail.height,
      release_focus: true
    });
  },
  bind_blur() {
    this.setData({
      input_bottom: 0,
      release_focus: false
    });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  commentAdd() {
    app.check_bind(() => {
      if (this.data.content.trim()) {
        wx.showLoading({ mask: true });

        let post = {
          note_id: this.data.note_id,
          content: this.data.content
        };

        if (this.data.to_cid) {
          post.to_cid = this.data.to_cid;
        }

        app.ajax('note/commentAdd', post, () => {
          this.setData({ content: '' });
          this.commentList();
        }, err => {
          app.modal(err.message);
        }, () => {
          wx.hideLoading();
        });
      }
    });
  },
  // 点赞/取消
  iLike() {
    app.check_bind(() => {
      if (!this.data.like_loading) {
        this.data.like_loading = true;

        let post = {
          note_id: this.data.note_id,
          token: app.user_data.token
        };

        app.ajax('note/iLike', post, (res) => {
          this.setData({
            like: res,
            'note.like': this.data.note.like + (res ? 1 : -1)
          });
        }, null, () => {
          this.data.like_loading = false;
        });
      }
    });
  },
  // 收藏/取消
  iCollect() {
    app.check_bind(() => {
      if (!this.data.collect_loading) {
        this.data.collect_loading = true;

        let post = {
          note_id: this.data.note_id,
          token: app.user_data.token
        };

        app.ajax('note/iCollect', post, (res) => {
          this.setData({ collect: res });
        }, null, () => {
          this.data.collect_loading = false;
        });
      }
    });
  },
  // 关注/取消关注
  iFocus() {
    app.check_bind(() => {
      if (!this.data.focus_loading) {
        this.data.focus_loading = true;

        let post = {
          token: app.user_data.token,
          to_uid: this.data.note.uid
        };

        app.ajax('note/iFocus', post, (res) => {
          this.setData({ focus: res });
        }, null, () => {
          this.data.focus_loading = false;
        });
      }
    });
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.note.uid });
    });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  commentList() {
    app.ajax('note/commentList', { note_id: this.data.note_id }, (res) => {
      app.avatar_format(res);
      app.ago_format(res, 'create_time');
      for (let i = 0; i < res.length; i++) {
        app.avatar_format(res[i].child);
        app.ago_format(res[i].child, 'create_time');
      }
      this.setData({ comment_list: res }, () => {
        this.count_comment();
      });
    });
  },
  // 计算评论条数
  count_comment() {
    let count = 0;
    for (let i = 0; i < this.data.comment_list.length; i++) {
      count += this.data.comment_list[i].child.length;
    }
    count += this.data.comment_list.length;
    this.setData({ comment_num: count });
  },
  show_input(e) {
    app.check_bind(() => {
      let re_user = e.currentTarget.dataset.re_user;
      this.data.to_cid = re_user.id;
      this.setData({
        re_name: '回复：' + re_user.nickname,
        release_focus: true
      });
    });
  },
  // 第一层评论
  commet_note() {
    app.check_bind(() => {
      this.data.to_cid = 0;
      this.setData({
        re_name: '我要评论...',
        release_focus: true
      });
    });
  }
});