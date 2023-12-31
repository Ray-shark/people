<template>
  <div class="container">
    <div class="app-container">
      <div class="left">
        <!-- @input:在input值发生改变时触发、@change:在失去焦点或者用户按下回车时触发 -->
        <!-- 模糊查询是通过查询参数queryParams的keyword传给后端，后端处理作查询返回对应的rows -->
        <el-input
          v-model="queryParams.keyword"
          style="margin-bottom:10px"
          type="text"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="输入员工姓名全员搜索"
          @input="changeValue"
        />
        <!-- 树形组件，需要到时候去ElementUI里面查 -->
        <!-- node-key:树节点唯一标识，:data:树里面的数据，
        :props:label表示展示data里面的哪个属性，children表示子树是data中哪个属性，
        default-expand-all:默认展开树，@current-change:切换节点时触发哪个方法，传递node作为参数到方法中
        -->
        <el-tree
          ref="deptTree"
          node-key="id"
          :data="depts"
          :props="defaultProps"
          default-expand-all
          :expand-on-click-node="false"
          highlight-current
          @current-change="selectNode"
        />
      </div>
      <div class="right">
        <el-row class="opeate-tools" type="flex" justify="end">
          <el-button size="mini" type="primary" @click="$router.push('/employee/detail')">添加员工</el-button>
          <el-button size="mini" @click="showExcelDialog = true">excel导入</el-button>
          <el-button size="mini" @click="exportEmployee">excel导出</el-button>
        </el-row>
        <!-- 表格组件 -->
        <el-table :data="list">
          <!-- 根据接口返回的数据结构，用prop表示 -->
          <el-table-column prop="staffPhoto" align="center" label="头像">
            <template v-slot="{ row }">
              <!-- 显示头像 staffPhoto:头像路径 -->
              <el-avatar v-if="row.staffPhoto" :src="row.staffPhoto" :size="30"/>
              <span v-else class="username">{{ row.username.charAt(0) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="姓名"/>
          <el-table-column prop="mobile" label="手机号" sortable/>
          <el-table-column prop="workNumber" label="工号" sortable/>
          <el-table-column prop="formOfEmployment" label="聘用形式">
            <template v-slot="{ row }">
              <span v-if="row.formOfEmployment === 1">正式</span>
              <span v-else-if="row.formOfEmployment === 2">非正式</span>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="部门"/>
          <el-table-column prop="timeOfEntry" label="入职时间" sortable/>
          <el-table-column label="操作" width="280px">
            <template v-slot="{ row }">
              <el-button type="text" size="mini" @click="$router.push(`/employee/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="mini" @click="btnRole(row.id)">角色</el-button>
              <!-- 气泡框 -->
              <el-popconfirm
                title="确定删除该行数据吗？"
                @onConfirm="confirmDel(row.id)"
              >
                <el-button slot="reference" style="margin-left:10px" size="mini" type="text">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-row type="flex" style="height: 60px" align="middle" justify="end">
          <el-pagination
            layout="total, prev, pager, next"
            :total="total"
            :current-page="queryParams.page"
            :page-size="queryParams.pageSize"
            @current-change="changePage"
          />
        </el-row>
      </div>
    </div>
    <!-- 放置导入组件 .sync修改子组件相同变量时父组件变量值也跟着改 -->
    <ImportExcel :show-excel-dialog.sync="showExcelDialog" @uploadSuccess="getEmployeeList"/>
    <el-dialog :visible.sync="showRoleDialog" title="分配角色">
      <!-- 弹层内容 -->
      <!-- checkbox_group v-model绑定存储的是所有选中项中label存的值，将每个值存成一个数组 -->
      <checkbox_group v-model="roleIds">
        <!-- 放置n个checkbox 要指定checkbox的存储值(label) -->
        <el-checkbox v-for="item in roleList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
      </checkbox_group>
      <!-- 确定和取消 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="mini" @click="btnRoleOK">确定</el-button>
          <el-button size="mini" @click="showRoleDialog=false">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getDepartment } from '@/api/department'
import { getEmployeeList, exprotEmployee, delEmployee, getEnableRoleList, getEmployeeDetail, assignRole } from '@/api/employee'
import { transListToTreeData } from '@/utils'
import FileSaver from 'file-saver'
import ImportExcel from '@/views/employee/components/import-excel'

export default {
  name: 'Employee',
  components: {
    ImportExcel
  },
  data() {
    return {
      depts: [], // 树组织数据
      roleList: [], // 角色列表
      roleIds: [], // 用来双向绑定角色数据
      currentUserId: null, // 用来记录当前点击用户的id
      defaultProps: {
        label: 'name', // 显示data数据中的name
        children: 'children'
      },
      // 存储查询参数
      queryParams: {
        departmentId: null,
        page: 1,
        pageSize: 10,
        keyword: ''
      },
      total: 0, // 记录员工总数
      list: [], // 存储员工列表的数据
      showExcelDialog: false, // 用来控制excel弹层的显示
      showRoleDialog: false // 用来控制角色弹层的显示
    }
  },
  created() {
    this.getDepartment()
  },
  methods: {
    async getDepartment() {
      // 递归方法，将列表转换为树形结构
      this.depts = transListToTreeData(await getDepartment(), 0)
      // 记录首个节点的id
      this.queryParams.departmentId = this.depts[0].id
      // 设置选中节点
      // 树组件渲染是异步的 必须等到更新完毕 用nextTick将后面的操作等待
      this.$nextTick(() => {
        // 此时意味着树渲染完毕
        this.$refs.deptTree.setCurrentKey(this.queryParams.departmentId)
      })
      // 这个时候已经记录了id，可以接着通过id调用获取员工列表的方法，完成列表初始化
      this.getEmployeeList()
    },
    // 切换树节点时改变查询参数（departmentId）
    selectNode(node) {
      this.queryParams.departmentId = node.id
      this.queryParams.page = 1
      this.getEmployeeList()
    },
    // 获取员工列表的方法
    async getEmployeeList() {
      const { rows, total } = await getEmployeeList(this.queryParams)
      this.list = rows
      this.total = total
    },
    // 切换页码,el-pagination的current-change事件会传入newPage（当前页）参数
    changePage(newPage) {
      this.queryParams.page = newPage
      this.getEmployeeList()
    },
    // 搜索输入值内容改变时触发
    changeValue() {
      // 防抖
      // 在this的实例上赋值了一个timer属性
      clearTimeout(this.timer) // 清理上一次定时器，第一次为空
      this.timer = setTimeout(() => {
        this.queryParams.page = 1
        this.getEmployeeList()
      }, 500)
    },
    // 导出员工的Excel
    async exportEmployee() {
      const result = await exprotEmployee() // 导出所有的员工接口
      // console.log(result) // 使用一个npm包 file-saver 直接将blob文件下载到本地
      // FileSaver.saveAs(blob对象, 文件名称)
      FileSaver.saveAs(result, '员工信息表.xlsx') // 下载文件
    },
    // 删除员工
    async confirmDel(id) {
      await delEmployee(id)
      // 判断当前页前端显示的数据是否只有一条
      if (this.list.length === 1 && this.queryParams.page > 1) {
        this.queryParams.page--
      }
      this.getEmployeeList()
      this.$message.success('删除员工成功')
    },
    // 点击角色按钮弹出层
    async btnRole(id) {
      this.roleList = await getEnableRoleList()
      // 记录当前点击的id
      this.currentUserId = id
      const { roleIds } = await getEmployeeDetail(id)
      this.roleIds = roleIds
      this.showRoleDialog = true // 先获取接口再显示，避免切换迟缓
    },
    // 点击角色的确定
    async btnRoleOK() {
      await assignRole({
        id: this.currentUserId,
        roleIds: this.roleIds
      })
      this.$message('分配用户角色成功')
      this.showRoleDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: #fff;
  display: flex;

  .left {
    width: 280px;
    padding: 20px;
    border-right: 1px solid #eaeef4;
  }

  .right {
    flex: 1;
    padding: 20px;

    .opeate-tools {
      margin: 10px;
    }

    .username {
      height: 30px;
      width: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 50%;
      color: #fff;
      background: #04C9BE;
      font-size: 12px;
      display: inline-block;
    }
  }
}
</style>
