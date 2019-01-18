/*
 * @Author: qiaozp 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: qiaozp
 * @Last Modified time: 2019-01-16 14:33:54
 * @Description:  住户管理
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="条形码">
					<el-input v-model="listQuery.carNum" placeholder="请输入条形码" clearable></el-input>
				</el-form-item>
				<el-form-item label="住户姓名">
					<el-input v-model="listQuery.equImei" placeholder="请输入住户姓名" clearable></el-input>
				</el-form-item>
				<el-form-item label="住户电话">
					<el-input v-model="listQuery.equImei" placeholder="请输入住户电话" clearable></el-input>
				</el-form-item>
				<el-form-item label="小区">
					<el-select v-model="listQuery.powerType" clearable placeholder="请选择小区">
						<el-option label="请选择" value=""></el-option>
						<!-- <el-option
						v-for="item in dictionaries.fuel_type"
						:key="item.dictCode"
						:label="item.dictName"
						:value="item.dictCode">
						</el-option> -->
					</el-select>					 
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
                <el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
				<!--导入按钮以及弹框  start-->
				<el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="importForm">导入</el-button> 
					<import :importVisible="importVisible" @changeImport="changeImports($event)"></import> 
				</el-form-item>
				<!-- <br/> -->
				
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='营业厅名称' prop="carNum"></el-table-column>
			<el-table-column align="center" label="营业厅电话" prop="deptName"></el-table-column>
		    <el-table-column align="center" label="联系人" prop="carBrand"></el-table-column>
			<el-table-column align="center" label="地市" prop="carModel"></el-table-column>
			<el-table-column align="center" label="区县" prop="powerType"></el-table-column>
			<el-table-column align="center" label="地址" prop="powerType"></el-table-column>
			<el-table-column align="center" label="备注" prop="powerType"></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
                    <el-button v-if="!permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="!permBtn.group_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import Import from '../../components/Import'; //导入弹框组件
	import Pagination from '../../components/Pagination';

	export default {
		components: {
			'import': Import,
			 'pagination': Pagination
		 },
		data() {
			const vm =this;
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
	                car_add: false,
					car_delete: false, 
					car_Modify: false, 
					car_check: false, 
					car_import: false,
					car_export: false,
					equment_Rule: false,
					driver_Rule: false
				},
				list:[], //表格list
				total: 0,
				listLoading: true,
				height: 540,
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					name: "",
				},
				//导入模板的参数
				importVisible:{
					imports: false,//弹框是否显示
					templateName: 'biz_vehicle',//下载模板的名称
				},
			}
		},
		mounted() {
			var vm = this;
			// vm.getPerm();
			vm.getList();
			this.$nextTick(function(){
				utils.getTableHeight((height)=>{
					this.height = height;
				});
			})
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			
		},
		watch: {
			
		},
		methods: {
			//获取当前页面的权限
			getPerm(){
				this.permBtn = utils.permsButton(this);
			},
			//获取列表数据
			//isBackHome 是否返回首页
			getList(isBackHome = false) {
				var vm = this;
				if (isBackHome) {
					if (vm.listQuery.iDisplayStart != 0) {
						vm.$refs.page.backFirstPage();
						return;
					}
				}
				vm.listLoading = true;
				//调用接口
				let param = JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/bizmgr/car/findCarList", param).then(res =>{	
					vm.listLoading = false;
		          	if(res.status == 200){
		                vm.list = res.data.data;
						vm.total = res.data.contTotal;
		            }else{
		                Message.error({message:"调用接口失败"});
		            }
		        }).catch(error => {
		        	vm.listLoading = false;
		        });
			},

			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},	

			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
			},
      		//导入
      		//打开导入文件的弹框
			importForm(){
				this.importVisible.imports = true;
			},
			//关闭导入文件弹框
			changeImports(param){
				this.importVisible.imports = param;
				this.getList(true);
			},  
      		
      		//导出
      		exportFormLists() {
				utils.exportLists(this.listQuery, "/proxy/bizmgr/car/export");
      		},  
		}
		
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
