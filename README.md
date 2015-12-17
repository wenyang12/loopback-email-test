+ [loopback与express的关系](#1)
+ [loopback是一个MVC框架，分别包含哪些部分](#2)
+ [loopback源代码架构介绍](#3)
+ [安装strongloop工具链并创建项目](#4)
+ [测试注册登陆效果](#5)
+ [配置mongodb](#6)
+ [配置环境变量](#7)

<h2 id="1">loopback与express的关系</h2>

+ express是内核
    + 不应该直接使用在商业项目
    + 粒度太小
    + 使用者需要handle太多细节
+ loopback是工具
    + 对于搭建一个Web2.0即可交互的网站系统 粒度合适

<h2 id="2">loopback是一个MVC框架，分别包含哪些部分</h2>

<!--more-->

+ 模型系统
    + PersistentModel
    + 鼓励使用者将大部分商业逻辑写于在模型中完成
+ 控制器
    + remote methods
    + remote hooks
+ 视图（沿用express的视图模型）
+ loopback组件
    + loopback-component-passport
    + loopback-component-storage
    + …

<h2 id="3">loopback源代码架构介绍</h2>

源代码地址：<https://github.com/strongloop/loopback>

其中主要看common/models 这个目录下的结构，它里边的js都是基于面向对象编程写的。每个js都对应着一个类，跟[loopback文档](https://apidocs.strongloop.com/loopback/)一一对应


<h2 id="4">安装strongloop工具链并创建项目</h2>

安装全局的[strongloop](https://strongloop.com/)
>$ npm install -g strongloop

创建lookback项目(这里我输入的项目名为loopback-test)
>$ slc loopback

运行项目
>$ slc run

在浏览器输入http://localhost:3000/explorer 即可看到效果

**或者你也可以不安装strongloop，直接到loopback的github下clone源代码下来**

>$ git clone https://github.com/strongloop/loopback.git

安装依赖
>$ npm install

运行项目
>$ node .


接下来我们创建一个模型model（一个模型对应一个数据表）
>$ slc lookback:model

输入以上命令之后，会提示输入名称，然后输入字段名，字段名的类型等，假如输入的简略代码如下：
```
? Enter model name：WenUsers
? Select the data-source to attach WenUsers to: db(memory) //选择数据源，即选用内存来存储数据
? Select model's base class: User //让WenUsers模型继承内建的User类
? ustom plural from(used to build REST URL):users //构建通过url访问这个WenUsers类的名称
? Property name：fullname//定义自己需要的字段名
? Proterty type: string //选择该字段的类型
? Required? NO  //提交时该字段的值是否必须输入，这里现在NO，即可选
```

建完之后，源代码会多出./common/models/这个路径，在这个路径下会有两个文件，文件结构（你也可以手动自己创建这些文件就不需要用strongloop构建了）为：

- common
    - models
        - wen-users.js
        - wen-users.json

```javascript
module.exports = function(WenUsers) {
  //add code 可以在这里给模型WenUsers添加方法
};
```

```javascript
{
  "name": "WenUsers",
  "plural": "users",
  "base": "User",
  "idInjection": true,
  "options": {
    "validateUpsert": true
  },
  "properties": {
    "fullname": {
      "type": "string"
    }
  },
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": {}
}
```

而在./server/model-config.json中会添加一个配置WenUsers

```
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  },
  "Users": {
    "dataSource":"db"
  },
  "AccessToken": {
    "dataSource": "db",
    "public": false
  },
  "ACL": {
    "dataSource": "db",
    "public": false
  },
  "RoleMapping": {
    "dataSource": "db",
    "public": false
  },
  "Role": {
    "dataSource": "db",
    "public": false
  },
  "WenUsers": {
    "dataSource": "db",
    "public": true
  }
}
```

此时运行项目`$ slc run`  在浏览器http://localhost:3000/explorer 预览 会多出一个WenUsers调试接口

接着我们要把内建的Users配置屏蔽掉（不屏蔽掉的话，下面我们调试WenUsers接口的时候会有问题），即让浏览器页面只显示WenUsers调试接口，

编辑`./server/model-config.json`

```javascript
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  },
  "AccessToken": {
    "dataSource": "db",
    "public": false
  },
  "ACL": {
    "dataSource": "db",
    "public": false
  },
  "RoleMapping": {
    "dataSource": "db",
    "public": false
  },
  "Role": {
    "dataSource": "db",
    "public": false
  },
  "WenUsers": {
    "dataSource": "db",
    "public": true
  }
}
```

接下来我们想要给WenUsers加入一个sayHi方法，然后暴露接口给http，即可以通过http访问。该如何实现呢？

首先，编辑一下这个文件`./common/models/wen-users.js`

```javascript
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
  )
};
```
接着在`./common/models/wen-users.json`配置访问权限

```javascript
{
  "name": "WenUsers",
  "plural": "users",
  "base": "User",
  "idInjection": true,
  "options": {
    "validateUpsert": true
  },
  "properties": {
    "fullname": {
      "type": "string"
    },
    "age": {
      "type": "number"
    }
  },
  "validations": [],
  "relations": {},
  "acls": [
    {
      "principalType": "ROLE",
      "principalId": "$everyone",
      "permission": "ALLOW",
      "property": "sayHi"
    }
  ],
  "methods": {}
}
```
现在重新运行项目`slc run` ,预览会发现，多出了一个`/users/say-hi `方法

点击 `Try it out！` 即会返回测试效果如下图：

![测试图](http://wenyang12.github.io/images/loopback-pic-1.png)

成功返回了`{"result": "hi"}`

<h2 id="5">测试注册登陆效果</h2>
**注册测试**

在页面中打开`/users` 注册，如图：

![测试图](http://wenyang12.github.io/images/loopback-pic-2.png)

点击`Try it out！` 按钮，注册成功会返回状态码200，如图：

![测试图](http://wenyang12.github.io/images/loopback-pic-2-1.png)

**登录测试**

在页面中打开`/users/login` 登录，如图：

![测试图](http://wenyang12.github.io/images/loopback-pic-3.png)

点击`Try it out！` 按钮，登录成功会返回状态码200，如图：

![测试图](http://wenyang12.github.io/images/loopback-pic-3-1.png)

>以上的数据是保存在内存中的，关闭项目，在重启项目之后，你会发现登录失败了，你刚刚注册的数据没有了，那怎么样才能让数据保留呢？


<h2 id="6">配置mongodb</h2>

***首先在你的电脑上安装[mongodb](http://www.mongodb.org)。***

MongoDB提供了可用于32位和64位系统的预编译二进制包，你可以从MongoDB官网下载安装，MongoDB预编译二进制包下载地址：<http://www.mongodb.org/downloads>

不会如何安装的可以参考[菜鸟教程mongodb安装](http://www.runoob.com/mongodb/mongodb-window-install.html)

>别忘记了创建数据目录 MongoDB将数据目录存储在 db 目录下。但是这个数据目录不会主动创建，我们在安装完成后需要创建它。请注意，数据目录应该放在根目录下（(如： C:\ 或者 D:\ 等 )。

**接下来要运用到mongodb数据库来保存用户数据,即要在loopback上添加mongodb数据源**

>$ slc loopback:datasource

接着填写相关的信息

```
? Enter the data-source name: mongodb
? Select the Connector for mongodb: MongoDB(supported by StrongLoop)
```
其实以上操作就是在`./server/datasources.json` 这个文件里添加了一个"mongodb"属性配置，代码如下：

```javascript
{
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "mongodb": {
    "url": "mongodb://localhost:27017/loopback-test",
    "name": "mongodb",
    "connector": "mongodb"
  }
}
```
>其中以上代码需要手动配置数据源的链接字符串"mongodb://localhost:27017/loopback-test"（项目的名称即用来充当了数据库的名称）。

***安装依赖***

> $ npm install loopback-connector-mongodb --save  //这里安装的是loopback链接mongodb的连接器


***接着编辑代码`./server/model-config.json`***

让以下数据模型都采用mongodb数据源来存储数据，代码如下：

```javascript
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  },
  "AccessToken": {
    "dataSource": "mongodb",
    "public": false
  },
  "ACL": {
    "dataSource": "mongodb",
    "public": false
  },
  "RoleMapping": {
    "dataSource": "mongodb",
    "public": false
  },
  "Role": {
    "dataSource": "mongodb",
    "public": false
  },
  "WenUsers": {
    "dataSource": "mongodb",
    "public": true
  }
}
```
>即把原先的`"dataSource"："db" `都改成`"dataSource"："mongodb" `

***测试运行***

运行mongodb服务器
>$ mongod

启动项目
>$ slc run

预览重新测试注册，登录，在关掉项目重启项目，再次登录你会发现，登录还是成功的，因为数据已经保存在mongodb里了。

***在mongodb里查看数据***

显示所有数据库
>$ show dbs


切换到loopback-test 数据库
>$ use loopback-test

显示当前数据库
>$ db

显示当前数据库下的集合
>$ show collections

查看某个模型数据
>$ db.WenUsers.findOne()

<h2 id="7">配置环境变量</h2>
设置环境变量是为了，在开发环境里使用一个数据库，然后在生产环境里使用另一个数据库，互相使用对应的数据库。

其实配置不同数据库，就是增加一个js文件，或者json文件都可以

在`./server/` 这个目录下，增加一个`datasources.dev.js`文件，然后编辑如下：

```javascript
exports.mongodb = {
  'url': 'mongodb://localhost:27017/loopback-test-dev',
  'name': 'mongodb',
  'connector': 'mongodb'
};
```
## OR `datasources.dev.json`

```javascript
{
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "mongodb": {
    "url": "mongodb://localhost:27017/loopback-test-dev",
    "name": "mongodb",
    "connector": "mongodb"
  }
}
```

然后在开发环境里，要连接这个数据库loopback-test-dev即可输入以下命令：

>$ set NODE_ENV=dev

接着运行项目，即可（此时要重新注册，然后登录测试，因为用了新的数据库）
>$ slc run

要想切换回使用刚刚的数据库（loopback-test），设置环境变量为空即可，因为默认使用的数据库，就是文件`./server/datasources.json`指向的数据库
>$ set NODE_ENV=""
>$ slc run

##参考质料
[极客学院使用 loopback 快速搭建用户系统视频](http://www.jikexueyuan.com/course/797_1.html)

[菜鸟教程mongodb安装](http://www.runoob.com/mongodb/mongodb-window-install.html)
