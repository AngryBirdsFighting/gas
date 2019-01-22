/*
 * @Author: qiaozp 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: qiaozp
 * @Last Modified time: 2019-01-16 14:33:54
 * @Description:  价格管理
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="价格方案名">
					<el-input v-model="listQuery.name" placeholder="请输入价格方案名" clearable></el-input>
				</el-form-item>
                <el-form-item label="用户类型">
					<el-select v-model="listQuery.userType" clearable placeholder="请选择用户">
						<el-option label="请选择" value=""></el-option>
						<el-option label="民用" value="1"></el-option>
						<el-option label="工业" value="2"></el-option>
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
			<el-table-column align="center" label='用户类型' prop="carNum"></el-table-column>
			<el-table-column align="center" label="价格方案名" prop="deptName"></el-table-column>
		    <el-table-column align="center" label="阶梯单价1" prop="carBrand"></el-table-column>
			<el-table-column align="center" label="阶梯用量1" prop="carModel"></el-table-column>
			<el-table-column align="center" label="阶梯单价2" prop="carBrand"></el-table-column>
			<el-table-column align="center" label="阶梯用量2" prop="carModel"></el-table-column>
            <el-table-column align="center" label="阶梯单价3" prop="carBrand"></el-table-column>
			<el-table-column align="center" label="阶梯用量3" prop="carModel"></el-table-column>
			<el-table-column align="center" label="生效日期" prop="carModel"></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
                    <el-button v-if="!permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		<!--新增弹框-->
		<el-dialog title="新增价格方案" :visible.sync="addFormVisible" top="10%" width="450px" lock-scroll class="dialog"
			:close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="addDialogForm"  :rules="rulesAdd" :model="addPrice" label-position="left" label-width="120px"
					v-loading="addLoad" element-loading-text="拼命加载中">					
							<el-form-item label="方案名称" prop="priceName">
									<el-input v-model="addPrice.priceName" :maxlength="9" placeholder="维护人" clearable></el-input>
							</el-form-item>
							<el-form-item label="用户类型" prop="userType">
									<el-input v-model="addPrice.userType" :maxlength="9" placeholder="用户类型" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格1" prop="ladderPrice1">
									<el-input v-model="addPrice.ladderPrice1" :maxlength="9" placeholder="阶梯价格1" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯用量1" prop="ladderCount1">
									<el-input v-model="addPrice.ladderCount1" :maxlength="9" placeholder="阶梯用量1" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格2" prop="ladderPrice2">
									<el-input v-model="addPrice.ladderPrice2" :maxlength="9" placeholder="阶梯价格2" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格2" prop="ladderCount2">
									<el-input v-model="addPrice.ladderCount2" :maxlength="9" placeholder="阶梯价格2" clearable></el-input>
							</el-form-item>
							<el-form-item label="阶梯价格3" prop="ladderPrice3">
									<el-input v-model="addPrice.ladderPrice3" :maxlength="9" placeholder="阶梯价格3" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格3" prop="ladderCount3">
									<el-input v-model="addPrice.ladderCount3" :maxlength="9" placeholder="阶梯价格3" clearable></el-input>
							</el-form-item>				
				<el-form-item class="formButton">
					<el-button @click="addFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleCreateSubmit('addDialogForm')" class="btnColor">确 定</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<!--编辑弹框-->
		<el-dialog title="编辑价格方案" :visible.sync="editFormVisible" top="10%" width="450px" lock-scroll class="dialog"
			:close-on-click-modal="false" :close-on-press-escape="false">
			<el-form class="small-space" ref="editDialogForm"  :rules="rulesAdd" :model="editPrice" label-position="left" label-width="120px"
					v-loading="addLoad" element-loading-text="拼命加载中">					
							<el-form-item label="方案名称" prop="priceName">
									<el-input v-model="editPrice.priceName" :maxlength="9" placeholder="维护人" clearable></el-input>
							</el-form-item>
							<el-form-item label="用户类型" prop="userType">
									<el-input v-model="editPrice.userType" :maxlength="9" placeholder="用户类型" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格1" prop="ladderPrice1">
									<el-input v-model="editPrice.ladderPrice1" :maxlength="9" placeholder="阶梯价格1" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯用量1" prop="ladderCount1">
									<el-input v-model="editPrice.ladderCount1" :maxlength="9" placeholder="阶梯用量1" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格2" prop="ladderPrice2">
									<el-input v-model="editPrice.ladderPrice2" :maxlength="9" placeholder="阶梯价格2" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格2" prop="ladderCount2">
									<el-input v-model="editPrice.ladderCount2" :maxlength="9" placeholder="阶梯价格2" clearable></el-input>
							</el-form-item>
							<el-form-item label="阶梯价格3" prop="ladderPrice3">
									<el-input v-model="editPrice.ladderPrice3" :maxlength="9" placeholder="阶梯价格3" clearable></el-input>
							</el-form-item>		
							<el-form-item label="阶梯价格3" prop="ladderCount3">
									<el-input v-model="editPrice.ladderCount3" :maxlength="9" placeholder="阶梯价格3" clearable></el-input>
							</el-form-item>				
				<el-form-item class="formButton">
					<el-button @click="editFormVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleCreateSubmit('editDialogForm')" class="btnColor">确 定</el-button>
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
					userType:""
				},
				addLoad: false,//新增加载状态
				addFormVisible:false,
				editFormVisible:false,
				//唯一性验证状态记录
				isValidate:{
					isOk: false   //点击确定第一时间将此变量设置为true
				},
				addPrice:{
					userType:"",
					priceName:"",
					ladderCount1: "",
					ladderPrice1:"",
					ladderCount2:"",
					ladderPrice2:"",
					ladderCount3:"",
					ladderPrice3:"",
				},
				editPrice:{
					userType:"",
					priceName:"",
					ladderCount1: "",
					ladderPrice1:"",
					ladderCount2:"",
					ladderPrice2:"",
					ladderCount3:"",
					ladderPrice3:"",
				},
				//新增编辑数据校验
				rulesAdd: {
					userType: [
						{ required: true, message: '请输入用户类型', trigger: 'change' }
					],
					priceName: [
						{ required: true, message: '请输入方案名称', trigger: 'change' }
					],
					ladderPrice1: [
						{ required: true, message: '请输入阶梯价格1', trigger: 'change' }
					]
					,
					ladderCount1: [
						{ required: true, message: '请输入阶梯用量1', trigger: 'change' }
					],
					ladderPrice2: [
						{ required: true, message: '请输入阶梯价格2', trigger: 'change' }
					]
					,
					ladderCount2: [
						{ required: true, message: '请输入阶梯用量2', trigger: 'change' }
					],
					ladderPrice3: [
						{ required: true, message: '请输入阶梯价格3', trigger: 'change' }
					]
					,
					ladderCount3: [
						{ required: true, message: '请输入阶梯用量3', trigger: 'change' }
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
			    //打开编辑弹窗
			handleEdit() {
			this.editFormVisible = true;
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
