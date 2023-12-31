<template>
  <div class="dashboard-container">
    <div class="app-container">
      <div class="edit-form">
        <el-form ref="userForm" :model="userInfo" :rules="rules" label-width="220px">
          <!-- 姓名 部门 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="姓名" prop="username">
                <el-input size="mini" v-model="userInfo.username" class="inputW" />
              </el-form-item>
            </el-col>

          </el-row>
          <!-- 工号 入职时间 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="工号" prop="workNumber">
                <!-- 工号是系统（后端自动生成的）不用编辑 -->
                <el-input disabled size="mini" v-model="userInfo.workNumber" class="inputW" />
              </el-form-item>
            </el-col>
          </el-row>
          <!--手机 聘用形式  -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="手机" prop="mobile">
                <!-- disable只取true or false两个布尔值 等号后面相当于if条件 -->
                <!-- 当中的两个!! 第一个表示将$route.params.id的字符串值取反变为布尔值 第二个将这个布尔值再取反 -->
                <el-input
                  :disabled="!!$route.params.id"
                  size="mini"
                  class="inputW"
                  v-model="userInfo.mobile"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="部门" prop="departmentId">
                <!-- 放置及联部门组件 会单独封装 -->
                <!-- inputW样式会给到selectTree中 template第一层的组件 -->
                <select-tree
                  class="inputW"
                  v-model="userInfo.departmentId"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="聘用形式" prop="formOfEmployment">
                <el-select size="mini" v-model="userInfo.formOfEmployment" class="inputW">
                  <el-option label="正式" value="1"/>
                  <el-option label="非正式" value="2"/>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="入职时间" prop="timeOfEntry">
                <el-date-picker
                  size="mini"
                  type="date"
                  value-format="yyyy-MM-dd"
                  class="inputW"
                  v-model="userInfo.timeOfEntry"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="转正时间" prop="correctionTime">
                <el-date-picker
                  size="mini"
                  type="date"
                  class="inputW"
                  v-model="userInfo.correctionTime"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 员工照片 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="员工头像">
                <!-- 放置上传图片 -->
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 保存个人信息 -->
          <el-row type="flex">
            <el-col :span="12" style="margin-left:220px">
              <el-button size="mini" type="primary" @click="saveData">保存更新</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>

    </div>
  </div>
</template>

<script>
import SelectTree from '@/views/employee/components/select-tree'
import { addEmployee, getEmployeeDetail, updateEmployee } from '@/api/employee'

export default {
  components: {
    SelectTree
  },
  data() {
    return {
      userInfo: {
        username: '', // 用户名
        mobile: '', // 手机号
        workNumber: '', // 工号
        formOfEmployment: null, // 聘用形式
        departmentId: null, // 部门id
        timeOfEntry: '', // 入职时间
        correctionTime: '' // 转正时间
      },
      rules: {
        username: [{ required: true, message: '请输入姓名', trigger: 'blur' }, {
          min: 1, max: 4, message: '姓名为1-4位'
        }],
        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }, {
          //   pattern 正则表达式
          pattern: /^1[3-9]\d{9}$/,
          message: '手机号格式不正确',
          trigger: 'blur'
        }],
        formOfEmployment: [{ required: true, message: '请选择聘用形式', trigger: 'blur' }],
        departmentId: [{ required: true, message: '请选择部门', trigger: 'blur' }],
        timeOfEntry: [{ required: true, message: '请选择入职时间', trigger: 'blur' }],
        correctionTime: [{ required: true, message: '请选择转正时间', trigger: 'blur' }, {
          validator: (rule, value, callback) => {
            if (this.userInfo.timeOfEntry) {
              if (new Date(this.userInfo.timeOfEntry) > new Date(value)) {
                callback(new Error('转正时间不能小于入职时间'))
                return
              }
            }
            callback()
          }
        }]
      }

    }
  },
  created() {
    // 通过$route获取路由信息，$router是路由器可以进行路由的操作（如跳转）,$route存储的是当前路由信息
    // 获取路由参数中的id
    if (this.$route.params.id) {
      this.getEmployeeDetail()
    }
  },
  methods: {
    saveData() {
      this.$refs.userForm.validate(async isOK => {
        if (isOK) {
          // 判断是否为编辑模式
          if (this.$route.params.id) {
            // 编辑模式 此时已经通过getEmployeeDetail方法在userInfo中添加了id
            await updateEmployee(this.userInfo)
            this.$message('更新成功')
          } else {
            // 新增模式
            // 校验通过
            await addEmployee(this.userInfo)
            this.$message.success('新增员工成功')
          }
          this.$router.push('/employee')
        }
      })
    },
    async getEmployeeDetail() {
      this.userInfo = await getEmployeeDetail(this.$route.params.id)
    }
  }
}
</script>

<style scoped lang="scss">
.edit-form {
  background: #fff;
  padding: 20px;
  .inputW {
    width: 380px
  }
}

</style>
