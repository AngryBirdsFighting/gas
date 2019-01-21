/*
 * @Author: qiaozp 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-21 10:45:23
 * @Description:  设备维护人
 */

<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="维护人">
					<el-input v-model="listQuery.name" placeholder="请输入维护人" clearable></el-input>
				</el-form-item>
                <el-form-item label="所属营业厅">
					<el-select v-model="listQuery.powerType" clearable placeholder="请选择营业厅">
						<el-option label="请选择" value=""></el-option>
						<el-option label="营业厅1" value="1"></el-option>  
						<el-option label="营业厅2" value="2"></el-option>
					</el-select>					 
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
                <el-form-item>  
					<el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='维护人' prop="name"></el-table-column>
			<el-table-column align="center" label="所属营业厅" prop="villageName"></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
                    <el-button v-if="!permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
                    <el-button v-if="!permBtn.group_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		
		<!--新增弹框-->
		<el-dialog title="新增营业厅" :visible.sync="addFormVisible" top="10%" width="350px" lock-scroll class="dialog_input"
			:close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm"  :rules="rulesAdd" :model="addEquPerson" label-position="left" label-width="120px"
					v-loading="addLoad" element-loading-text="拼命加载中">
				<el-row>
					<el-col :span="24">
						<div class="grid-content bg-purple">
							<el-form-item label="所属营业厅" prop="point">
								<el-select v-model="addEquPerson.point" filterable clearable  placeholder="请选择营业厅">	
									<el-option 	:value="'空'">空</el-option>
									<!-- <el-option
									v-for="item in dictionaries.car_brands"
									:value="item.dictCode"
									:label="item.dictName"
									:key="item.dictCode">
									</el-option> -->
								</el-select>	
							</el-form-item>						
							<el-form-item label="维护人" prop="equPerson">
									<el-input v-model="addEquPerson.equPerson" :maxlength="9" placeholder="维护人" clearable></el-input>
							   </el-form-item>		
						</div>	   
					</el-col>
				</el-row>
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import Pagination from '../../components/Pagination';

	export default {
		components: {
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
				addLoad: false,//新增加载状态
				addFormVisible:false,
				//唯一性验证状态记录
				isValidate:{
					isOk: false   //点击确定第一时间将此变量设置为true
				},
				addEquPerson:{
					equPerson:"",
					point:""
				},
				//新增编辑数据校验
				rulesAdd: {
					equPerson: [
						{ required: true, message: '请输入维护人', trigger: 'change' }
					],
					point: [
						{ required: true, message: '请选择营业厅', trigger: 'change' }
					]
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
		        vm.$instance.post("/proxy/info/personnel", param).then(res =>{	
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
			//打开新增弹窗
			handleCreate(){
				this.addFormVisible = true;
			},
			//新增确定
			handleCreateSubmit(formName) {								
				this.isValidate.isOk = true;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.createSubmit();
					}
					this.isValidate.isOk = false;
				});
			},	
			createSubmit(){
				alert("1")
			}	
		}
		
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
