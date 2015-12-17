module.exports = function(WenUsers) {
  WenUsers.sayHi = function(callback) {//定义一个http接口方法
    callback(null, 'hi');
  };
  WenUsers.remoteMethod(//把方法暴露给http接口
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
  WenUsers.afterRemote('create',function(context, user, next) {//注册后的回调
    console.log("> user.afterRemote triggered");
    var options={//配置邮件发送参数
      type: 'email',
      to: user.email, //邮件接收方，即注册时填入的有限地址
      from: '408523614@qq.com',//邮件发送方
      subject: 'Thanks for registering.',//发送的邮件标题
      redirect: '/',//点击发送到邮件的链接激活账号后的回调http地址
      user: user
    };
    user.verify(options, next);
  })
};
