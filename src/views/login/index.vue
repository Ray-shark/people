<template>
  <div class="login-container">
    <div class="logo"/>
    <div class="form">
      <h1>登录</h1>
      <el-card shadow="never" class="login-card">
        <!--登录表单-->
        <!-- el-form > el-form-item > el-input -->
        <el-form ref="form" :model="loginFrom" :rules="loginRules">
          <el-form-item prop="mobile">
            <el-input v-model="loginFrom.mobile" placeholder="请输入手机号"/>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginFrom.password" show-password placeholder="请输入密码"/>
          </el-form-item>
          <el-form-item prop="isAgree">
            <el-checkbox v-model="loginFrom.isAgree">
              用户平台使用协议
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button @click="login" style="width: 350px" type="primary">登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data() {
    return {
      loginFrom: {
        // 判断是不是开发环境，区分环境取默认值
        mobile: process.env.NODE_ENV === 'development' ? '13800000002' : '',
        password: process.env.NODE_ENV === 'development' ? 'hm#qd@23!' : '',
        isAgree: process.env.NODE_ENV === 'development'
      },
      loginRules: {
        // 手机的两个规则
        mobile: [{
          required: true, // 手机号是否必须填写
          message: '请输入手机号', // 提示信息
          trigger: 'blur' // 失去焦点触发校验
        }, {
          pattern: /^1[3-9]\d{9}$/, // 正则表达式设置手机格式
          message: '请输入正确的手机号',
          trigger: 'blur'
        }],
        // 密码的两个规则
        password: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }, {
          min: 6,
          max: 16,
          message: '密码长度应该为6-16位之间',
          trigger: 'blur'
        }],
        // required只能检测 null undefined ""，不能检测false
        isAgree: [{
          // 自定义校验validator
          validator: (rule, value, callback) => {
            // rule 校验规则
            // value 校验的值
            // callback 执行函数（必须执行） 类似于promise函数 resolve reject
            // callback()成功   callback(new Error(错误信息))失败
            value ? callback() : callback(new Error('请勾选用户协议'))
          }
        }]
      }
    }
  },
  methods: {
    // 表单整体校验
    login() {
      this.$refs.form.validate(async(isOK) => {
        // 如果校验通过 isOK=true
        if (isOK) {
          // Vuex中的action返回的是一个Promise
          // 等待登录成功后才跳转主页
          await this.$store.dispatch('user/login', this.loginFrom)
          this.$router.push('/')
        }
      })
    }
  }
}
</script>

<style lang="scss">
.login-container {
  display: flex;
  align-items: stretch;
  height: 100vh;

  .logo {
    flex: 3;
    background: rgba(38, 72, 176) url(../../assets/common/login_back.png) no-repeat center / cover;
    border-top-right-radius: 60px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    padding: 0 100px;

    .icon {
      background: url(../../assets/common/logo.png) no-repeat 70px center /
        contain;
      width: 300px;
      height: 50px;
      margin-bottom: 50px;
    }

    p {
      color: #fff;
      font-size: 18px;
      margin-top: 20px;
      width: 300px;
      text-align: center;
    }
  }

  .form {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 176px;

    .el-card {
      border: none;
      padding: 0;
    }

    h1 {
      padding-left: 20px;
      font-size: 24px;
    }

    .el-input {
      width: 350px;
      height: 44px;

      .el-input__inner {
        background: #f4f5fb;
      }
    }

    .el-checkbox {
      color: #606266;
    }
  }
}
</style>
