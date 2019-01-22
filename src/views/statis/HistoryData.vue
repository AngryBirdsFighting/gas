/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-18 11:18:49
 * @Description:  历史记录
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="住户编号">
					<el-input v-model="listQuery.equImei" placeholder="请输入住户编号" clearable></el-input>
				</el-form-item>
				<el-form-item label="条形码" class="barCode">
					<el-input v-model="listQuery.equImei" placeholder="请输入条形码" clearable></el-input>
				</el-form-item>
				<el-form-item label="采集时间" >
					<date-time-picker ref="datePicker" :isTodayBefore="true"></date-time-picker>
				</el-form-item>
				
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.car_add" class="filter-item btnColor" type="primary" icon="el-icon-plus" @click="handleCreate">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="permBtn.car_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
				<!--导入按钮以及弹框  start-->
				<!-- <el-form-item>
					<el-button class="filter-item" type="primary" icon="el-icon-upload2" @click="importForm">导入</el-button> 
					<import :importVisible="importVisible" @changeImport="changeImports($event)"></import> 
				</el-form-item> -->
				<!-- <br/> -->
				
				<!--导入按钮以及弹框  end-->
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="userName"></el-table-column>
			<el-table-column align="center" label="电话" prop="phone"></el-table-column>
		    <el-table-column align="center" label="小区" prop="community"></el-table-column>
			<el-table-column align="center" label="条形码" prop="barCode" width="250"></el-table-column>
			<el-table-column align="center" label="采集时间" prop="collectionTime"></el-table-column>
			<el-table-column align="center" label="计费方式" prop="billingType"></el-table-column>
			<el-table-column align="center" label="昨日用气量/L" prop="yesterdayGasMeasure"></el-table-column>
			<el-table-column align="center" label="累计用气量/L" prop="allGasMeasure"></el-table-column>
			<!-- <el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button v-if="permBtn.group_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="查看"></el-button>
					<el-button v-if="permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="修改"></el-button>
					<el-button v-if="permBtn.group_delete" class="btn delete" size="small" @click="handleDelete(scope.$index, scope.row)" title="删除"></el-button>
				</template>
			</el-table-column> -->
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
	import DepartSelect from '../../components/DepartSelect';
	import Pagination from '../../components/Pagination';
	import DateTimePicker from '../../components/DateTimePicker';//日期组件

	export default {
		components: {
			'import': Import,
			'depart_select':DepartSelect,
			'pagination': Pagination,
			'date-time-picker': DateTimePicker ,//日期组件
		 },
		data() {
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
	                
				},
				list:[], //表格list
				total: 0,
				driverTotal: 0,
				listLoading: true,
				height: 540,
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					powerType: "",
					useType: "",
					driverName: "",
					deptId: "",
					carNum: "",
					equImei: "",//设备imei
				},
			}
		},
		mounted() {
			var vm = this;
			// vm.getPerm();
			vm.getList();
			vm.getDictionaries();
			this.$nextTick(function(){
				utils.getTableHeight((height)=>{
					this.height = height;
				});
			})
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			if(this.waitTime){
				this.waitTime = clearInterval(this.waitTime); //去掉定时器的方法   同一个变量做定时器
			}
		},
		watch: {
			driverFormVisible(curVal, oldVal) {
                if(!oldVal){
					this.bindDriverData.driverId = ''
				}
			},
			equImeiFormVisible(curVal, oldVal) {
                if(oldVal){
					this.bindEquImeiForm.carId = '';
					this.bindEquImeiForm.carNum = '';
					this.bindEquImeiForm.equId = ''
				}
			}
		},
		methods: {
			//获取当前页面的权限
			// getPerm(){
			// 	this.permBtn = utils.permsButton(this);
			// },
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
		        vm.$instance.get("/proxy/statis/findHistoryData", {params:param}).then(res =>{	
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
			//获取字典
			getDictionaries() {
				var vm = this;
				let arr = ["fuel_type","car_plate_color","car_use","car_brands","car_color"];
				utils.batchDictsByCode(arr, data => {
					vm.dictionaries = data;
				})
			},
			currentCarBrandChange_add(val) {
				this.getCarType(val, "add");
			},
			currentCarBrandChange_edit(val) {
				this.getCarType(val, "edit");
			},
			//根据所选车辆品牌，加载车辆型号
			getCarType(val, type) {
				this.car_model = [];
				if (type == "add") {
						this.addCar.carModel = "";
						this.editCar.carModel = "";
					} else {
						this.addCar.carModel = "";
						this.editCar.carModel = "";
					}
				// if (!val || val == "") {
				// 	this.car_model = [];
				// 	if (type == "add") {
				// 		this.addCar.carModel = "";
				// 	} else {
				// 		this.editCar.carModel = "";
				// 	}
				// 	return;
				// }
				var vm = this;
				utils.dictsByCode(val, data => {
					vm.car_model = data;
				});
			},
			//获取未绑定驾驶员
			getDriverData(isBackHome = false) {
				var vm = this;
				if (isBackHome) {
					if (vm.driverListQuery.iDisplayStart != 0) {
						this.$refs.pageDriver.backFirstPage();
						return;
					}
				}	
				vm.driverTableLoad = true;		
				//调用驾驶员列表接口
				let param = JSON.parse(JSON.stringify(vm.driverListQuery));
				vm.$instance.post("/proxy/bizmgr/driver/findDriverList", param).then(res =>{
					vm.driverTableLoad = false;		
					if(res.status == 200){
						vm.driverData = res.data.data;
						vm.driverTotal = res.data.contTotal;
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					
				});
			},
			//获取未绑定驾设备
			getEquImeiData(deptId) {
				var vm = this;
				let param = {
				    deptId: deptId
				};
				vm.$instance.get("/proxy/bizmgr/equ/findUnboundEqus",{params: param}).then(res =>{
					if(res.status == 200){
						vm.equImeiData = res.data;
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					
				});
			},
			//根据Id获取数据
			getCarData(carId, type) {
				let vm = this;
				let param = {};
				param.carId = carId;
				//调用接口
				vm.$instance.get("/proxy/bizmgr/car/findCarInfo", {params: param}).then(res =>{
					if(res.status == 200){
						vm.carInfo = res.data;
						if(type == "edit"){
							vm.currentCarBrandChange_edit(vm.carInfo.carBrand);
							for (var i in this.editCar){
								vm.editCar[i] = vm.editCar[i] || vm.carInfo[i];
							}
							if (vm.$refs.editDepartSelect) {
								vm.$refs.editDepartSelect.setCurrentSelect(vm.editCar.deptId);
							} else {
								vm.waitTime = window.setInterval(()=>{
									if (vm.$refs.editDepartSelect) {
										vm.waitTime = window.clearInterval(vm.waitTime);
										vm.$refs.editDepartSelect.setCurrentSelect(vm.editCar.deptId);
									}
								}, 100);
							}
						}							
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.checkFormVisible = false; 
					vm.updateFormVisible = false; 
					Message.error({
						message:"数据获取失败！"
					});
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
			/**
			 * 分页改变，加载数据--驾驶员绑定
			 */
			driverPaginationChange(pageData) {
				this.driverListQuery.iDisplayStart = pageData.iDisplayStart;
				this.driverListQuery.iDisplayLength = pageData.iDisplayLength;
				this.getDriverData();
			},		
			deptCurrentChange(deptId) {
				this.listQuery.deptId = deptId;
			},
			
			//打开新增弹窗
			handleCreate() {
				let obj = this.addCar;
				for (const item in obj) {
					if (obj.hasOwnProperty(item)) {
						obj[item] = ""						
					}
				}				
				this.isValidate.account = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				this.addFormVisible = true;
				this.car_model = [];
				if (this.$refs.addDepartSelect) {
					this.$refs.addDepartSelect.deptClear();
				}
				this.resetForm("addDialogForm");
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
			//新增车辆提交
			createSubmit() {
				var vm = this;
				vm.addLoad = true;
				let param = JSON.parse(JSON.stringify(vm.addCar));
				vm.$instance.post("/proxy/bizmgr/car/addCar", param).then(res =>{
					vm.addLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.addFormVisible = false;
							Message({
					          showClose: true,
					          message: '新增成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){
					          	vm.getList(true);
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}						
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.addLoad = false;
				});	
			},
			//点击选中行选择驾驶员
			handleRowChange(val,row) {
				if(row.driverId){
                    this.bindDriverData.driverId = row.driverId;
				}			
			},
			// 关闭驾驶员列表
			closeDriverTable(){
				this.$refs.driverTable.setCurrentRow();
				this.driverFormVisible = false;
			},
			//查看
			check(index, row) {
				this.carInfo = null;
				this.getCarData(row.carId);
				this.checkFormVisible = true;
			},
			//删除
			handleDelete(index, row) {
				if(row.driverName != null || row.equImei != null){
					this.$message({
			          	message: '此车辆被绑定，不能删除，请解绑后进行删除！',
			          	type: 'warning',
			          	duration: '1500'
			        });
		    		return;
				}
				var vm = this;
				let param = {};
				param.carId = row.carId;
				//确定删除
				this.$confirm('是否删除< '+ row.carNum +' >车辆！', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					vm.$instance.post("/proxy/bizmgr/car/deleteCar", param).then(res =>{
						if(res.status == 200){
							if (res.data.success) {
								Message.success({message: '删除成功！'});
								vm.$refs.page.deleteItemReLoadList();
							} else {
								Message.error({message:res.data.errorMsg});
							}
						}else{
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {});
				}).catch(() => {
					Message.info({message: '已取消删除'});          
				});
			},
			//新增部门选择改变
			addDeptCurrentChange(deptId){
				this.addCar.deptId = deptId;
				this.$refs.addDialogForm.validateField("deptId");
			},
			//新增编辑部门选择改变
			editDeptCurrentChange(deptId){
				this.editCar.deptId = deptId;
				this.$refs.editDialogForm.validateField("deptId");
			},
			//修改获取信息
			handleEdit(index, row) {
			    for (var i in this.editCar){
					this.editCar[i] = ""
				};
				// if(row.driverName != null || row.equImei != null){
				// 	this.$message({
			    //       	message: '此车辆被绑定，不能修改，请解绑后进行修改！',
			    //       	type: 'warning',
			    //       	duration: '1500'
			    //     });
		    	// 	return;
				// }
				this.isValidate.account = false;
				this.isValidate.phone = false;
				this.isValidate.isOk = false;
				let obj = this.editCar;
				for (const item in obj) {
					if (obj.hasOwnProperty(item)) {
						obj[item] = ""						
					}
				}
				this.car_model = [];
				this.editCar.carId = row.carId;
				this.getCarData(row.carId, 'edit')		
				this.updateFormVisible = true;
			},
			//修改确定
		    handleEditSubmit(formName) {
				this.isValidate.isOk = true;
				validate.isValidate(this, formName, (formData)=>{
					if(formData.validates){
						this.editSubmit();
					}
					vm.isValidate.isOk = false;
				});
			},
			//修改提交
		    editSubmit() {
				var vm = this;
				vm.updateLoad = true;
				let param = JSON.parse(JSON.stringify(vm.editCar));
				vm.$instance.post("/proxy/bizmgr/car/modifyCar", param).then(res =>{
					vm.updateLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.updateFormVisible = false;
							Message({
					          showClose: true,
					          message: '修改成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.getList();
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.updateLoad = false;
				});
			},
			//设备绑定弹窗
			openBindEquImei(index, row, Type) {
				this.radio = ""
				this.equImeiFormVisible = true;
				this.getEquImeiData(row.deptId);
				this.bindEquImeiForm.carId = row.carId;
				this.bindEquImeiForm.carNum = row.carNum;
			},
			//驾驶员绑定弹窗
			openBindDriver(index, row) {
				this.driverFormVisible = true;
				this.driverListQuery.deptId = row.deptId
				this.getDriverData();
				this.bindDriverData.carId = row.carId;
			},
			//打开设备解绑弹窗
			openUnbindEquImei(index, row, Type) {
				var vm = this;
				vm.UnBindEquImeiData.carNum = row.carNum;
				vm.UnBindEquImeiData.equImei = row.equImei;
				vm.UnBindEquImeiData.carId = row.carId;
				vm.UnBindEquImeiData.equId = row.equId;
				vm.UnBindEquImeiData.status = "N";
				vm.UnbindEquImeiVisible = true;			
			},
			//打开驾驶员解绑弹窗
			openUnbindDriver(index, row, Type) {
				var vm = this;
				let param = {};
				vm.UnBindDriverData.carNum = row.carNum;
				vm.UnBindDriverData.driverName= row.driverName;
				vm.UnBindDriverData.carId = row.carId;
				vm.UnBindDriverData.driverId= row.driverId;
				vm.UnBindDriverData.status = "N";
				vm.UnbindDriverVisible = true;
			},
			//设备解绑接口
			UnbindEquImeiSubmit(){
				let vm = this;
				let param = {
					carId:  vm.UnBindEquImeiData.carId,
					equId:  vm.UnBindEquImeiData.equId	,
					status:  vm.UnBindEquImeiData.status,
				}
				vm.imeiUnLoad = true;
                vm.$instance.post("/proxy/bizmgr/car/bindUnbindEqu", param).then(res =>{
                	vm.imeiUnLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.UnbindEquImeiVisible = false;
							Message({
					          showClose: true,
					          message: '解绑成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.getList();
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.imeiUnLoad = false;
				});
			},
			//驾驶员解绑接口
			UnbindDriverSubmit(){
				let vm = this;
				let param = {
					carId:  vm.UnBindDriverData.carId,
					driverId:  vm.UnBindDriverData.driverId	,
					status:  vm.UnBindDriverData.status
				}
				vm.driverUnLoad = true;
                vm.$instance.get("/proxy/bizmgr/car/bindUnbindDriver",{params: param}).then(res =>{
                	vm.driverUnLoad = false;
					if(res.status == 200){
						if (res.data.success) {
							vm.UnbindDriverVisible = false;
							Message({
					          showClose: true,
					          message: '解绑成功',
					          type: 'success',
					          duration: 1000 ,
					          onClose: function(){	
								vm.getList();
					          }
					        });
						} else {
							Message.error({message:res.data.errorMsg});
						}
					}else{
						Message.error({message:"调用接口失败"});
					}
				}).catch(error => {
					vm.driverUnLoad = false;
				});
			},
			//驾驶员绑定接口
			bindDriverSubmit() {
				let vm = this;
                if (vm.bindDriverData.driverId){
                	vm.driverLoad = true;
					vm.bindDriverData.status = "Y";
					let param = vm.bindDriverData;
                    vm.$instance.get("/proxy/bizmgr/car/bindUnbindDriver",{params: param} ).then(res =>{
                    	vm.driverLoad = false;
						if(res.status == 200){
							if (res.data.success) {
								vm.driverFormVisible = false;
								Message({
						          showClose: true,
						          message: '绑定成功',
						          type: 'success',
						          duration: 1000 ,
						          onClose: function(){
						          	vm.getList();
						          }
						        });
							} else {
								Message.error({message:res.data.errorMsg});
							}
						}else{
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {
						vm.driverLoad = false;
					});
				}else{
					Message.info({message: '请选择驾驶员'}); 
				}
			},
            //设备绑定接口
			bindEquImeiSubmit() {
				let vm = this;
                if (this.bindEquImeiForm.equId){
                	vm.imeiLoad = true;
					this.bindEquImeiForm.status = "Y";
					let param = this.bindEquImeiForm;
                    this.$instance.post("/proxy/bizmgr/car/bindUnbindEqu", param).then(res =>{
                    	vm.imeiLoad = false;
						if(res.status == 200){
							if (res.data.success) {							
								vm.equImeiFormVisible = false;
								Message({
						          showClose: true,
						          message: '绑定成功',
						          type: 'success',
						          duration: 1000 ,
						          onClose: function(){
						          	vm.getList();
						          }
						        });
							} else {
								Message.error({message:res.data.errorMsg});
							}
						}else{
							Message.error({message:"调用接口失败"});
						}
					}).catch(error => {
						vm.imeiLoad = false;
					});
				}else{
					Message.info({message: '请选择设备'}); 
				}
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
	.driver-table tbody tr:nth-child(odd){
		background: #fff;
	}
	.device-imei>div>div {
		cursor: pointer;
		width: 160px;
		height: 30px;
		line-height: 30px;
		padding: 0 10px;
		color: #c0c4cc;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
	}
	
	.box .el-dialog {
		width: 25%;
	}
	
	.el-tabs__nav-wrap::after{
		background: none;
	}
	
	.el-tabs__item{
		border: 1px solid #e9e9e9;
		text-align: center;
		border-radius: 4px;
		-webkit-border-radius: 4px;
    	-moz-border-radius: 4px;
    	padding: 0 30px !important;
	}
	.el-tabs__item.is-active{
		background: #1e4d78;
		border: 1px solid #1e4d78;
		color: #fff;
	}
	.el-tabs__active-bar{
		background: none;
	}
	.box form{
		padding-left: 50px;
	}
	.dialogDeptTree {
		border: 1px solid #ddd;
		max-height: 150px;
		overflow-y: auto; 
	}
	.text-btn{
		cursor: pointer;
		color: #67d3e0;
	}
	.equimei-dialog{
		.el-form-item__content{
			width: 227px!important;
			.el-select, .el-input{
				width: 100%;
			}
		}
		.equimei-text{
			color: #969696;
			font-size: 12px;
			text-align: center;
		}		
	}
	.confirm{
		& span, & i{
			display: inline-block;
			vertical-align: middle;
		}
		& .confirm-top{
			text-align: center;
			font-size: 20px;
		    & span, & i{
				display: inline-block;
				vertical-align: middle;
			}
			& .confirm-text{				
                font-weight: 700;				
			}
		
		}
		& .confirm-bottom{
			margin-top: 20px;
			text-align: center;
			& span{
				width: 35%;
			}
		}	

	}
</style>
