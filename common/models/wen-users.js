module.exports = function(WenUsers) {
  WenUsers.sayHi = function(callback) {
    callback(null, 'hi');
  };
  WenUsers.remoteMethod(
    'sayHi',
    {
      'accepts': [],
      'returns':[
        {'arg': 'result','type': 'string'}
      ],
      'http':{
        'verb': 'get',
        'path': '/say-hi'
      }
    }
  );
  WenUsers.afterRemote('create', function(context, user, next) {//注册后的回调
    console.log('> user.afterRemote triggered');
    var options = {//设置邮件发送参数
      type: 'email',
      to: user.email,//邮件接收方
      from: '408523614@qq.com',//邮件发送方
      subject: '谢谢注册！',//邮件标题
      redirect: '/',//点击发送到邮件的链接激活账号后的回调http地址
      user: user
    };

   /* user.verify(options, function(err, response, next) {
      if (err) return next(err);
      console.log('> verification email sent:', response);
    });*/
    user.verify(options, next);
  });
};
