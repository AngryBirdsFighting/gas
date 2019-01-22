/*
 * @Author: qiaozp 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: zhipeng qiao
 * @Last Modified time: 2019-01-21 15:47:00
 * @Description:  告警监控
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="住户姓名">
					<el-input v-model="listQuery.name" placeholder="请输入住户姓名" clearable></el-input>
				</el-form-item>
				<el-form-item label="住户编号">
					<el-input v-model="listQuery.householdCode" placeholder="请输入住户编号" clearable></el-input>
				</el-form-item>
				<el-form-item label="小区">
					<el-select v-model="listQuery.villageName" clearable placeholder="请选择小区">
						<el-option label="请选择" value=""></el-option>
						<!-- <el-option
						v-for="item in dictionaries.fuel_type"
						:key="item.dictCode"
						:label="item.dictName"
						:value="item.dictCode">
						</el-option> -->
					</el-select>					 
				</el-form-item>
				<el-form-item label="告警类型">
					<el-select v-model="listQuery.alarmType" clearable placeholder="请选择告警类型">
						<el-option label="请选择" value=""></el-option>
						<!-- <el-option
						v-for="item in dictionaries.fuel_type"
						:key="item.dictCode"
						:label="item.dictName"
						:value="item.dictCode">
						</el-option> -->
					</el-select>					 
				</el-form-item>
				<el-form-item label="告警时间" >
					<date-time-picker v-model="listQuery.alarmTime" ref="datePicker" :isTodayBefore="true"></date-time-picker>
				</el-form-item>
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="name"></el-table-column>
			<el-table-column align="center" label="住户编号" prop="householdCode"></el-table-column>
		    <el-table-column align="center" label="小区" prop="villageName"></el-table-column>
			<el-table-column align="center" label="告警类型" prop="alarmType"></el-table-column>
			<el-table-column align="center" label="告警时间" prop="alarmTime"></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button v-if="!permBtn.group_check" class="btn order" size="small" @click="assign(scope.$index, scope.row)" title="派发工单"></el-button>
					<el-button v-if="!permBtn.group_modify" class="btn gnore" size="small" @click="ignore(scope.$index, scope.row)" title="忽略"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>

		<!-- 工单派发弹框 -->
		<el-dialog title="工单派发" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="orderFormVisible" width="730px" height="450px" top="10%" lock-scroll class="boxres">
			<div v-loading="personnelTableLoad" element-loading-text="拼命加载中">
				<div>
					<el-form :inline="true" :model="workOrderQuery" class="demo-form-inline">
						<el-form-item label="姓名：">
							<el-input v-model="workOrderQuery.personnel" size="227px" placeholder="请输入姓名"></el-input>
						</el-form-item>
						<el-form-item label="营业厅">
							<el-select v-model="workOrderQuery.point" clearable placeholder="请选择营业厅">
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
							<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="getPersonnelData(true)">查询</el-button>
						</el-form-item>
					</el-form>
					
				</div>
				<div style="width:100%; height:250px; margin:0 auto;">
					<el-table class="driver-table" ref="personnelTable" height="250" :data="personnelData" style = "width:100%"  highlight-current-row 
							v-loading="personnelTableLoad" element-loading-text="拼命加载中">
						<el-table-column align="center" label='维修人' prop="driverName"></el-table-column>
						<el-table-column align="center" label="所属营业厅" prop="deptName"></el-table-column>
			    	</el-table>
				</div>
				<!-- 分页 -->
				<pagination ref="pagePersonnel" :total="personnelTotal" @reLoadData="personnelPaginationChange"></pagination>

			    <div class="formButton">
					<el-button @click="closePersonnelTable">取 消</el-button>
					<el-button type="primary" @click.native.prevent="bindPersonnelSubmit()" class="btnColor">保 存</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import Pagination from '../../components/Pagination';
	import DateTimePicker from '../../components/DateTimePicker';//日期组件

	export default {
		components: {
			'pagination': Pagination,
			'date-time-picker': DateTimePicker ,//日期组件
		},
		data() {
			const vm =this;
			return {
				permBtn:{//按钮的权限 查询query 新增add   true 显示  false 隐藏
	                
				},
				list:[], //表格list
				total: 0,
				personnelTotal: 0,
				listLoading: false,
				persoonelTotal: false,
				personnelTableLoad: false,
				height: 540,
				//告警列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					name: "",
					householdCode: "",
					villageName: "",
					alarmType: "",
					alarmTime: ""
				},
				//工单派发查询参数
				workOrderQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					personnel: "",
					point: ""
				},
				personnelData: [], //维护人列表数据
				orderFormVisible: false, //分派工单弹框
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
				let vm = this;
				if (isBackHome) {
					if (vm.listQuery.iDisplayStart != 0) {
						vm.$refs.page.backFirstPage();
						return;
					}
				}
				vm.listLoading = true;
				//调用接口
				let param = JSON.parse(JSON.stringify(vm.listQuery));
		        vm.$instance.post("/proxy/alarm/queryList", param).then(res =>{	
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

			// 派发 
			assign(index, row) {
				let vm = this
				vm.orderFormVisible = true
			},

			//忽略
			ignore(index, row) {
				let vm = this
				//确定忽略
				this.$confirm('确定忽略此告警消息么？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					//调用接口
					// vm.$instance.post("/proxy/bizmgr/car/deleteCar", param).then(res =>{
					// 	if(res.status == 200){
					// 		if (res.data.success) {
					// 			Message.success({message: '删除成功！'});
					// 			vm.$refs.page.deleteItemReLoadList();
					// 		} else {
					// 			Message.error({message:res.data.errorMsg});
					// 		}
					// 	}else{
					// 		Message.error({message:"调用接口失败"});
					// 	}
					// }).catch(error => {});
				}).catch(() => {
					Message.info({message: '已取消删除', duration: 1000});          
				});
			},

			getPersonnelData() {

			},

			personnelPaginationChange() {

			},

			bindPersonnelSubmit() {

			},

			closePersonnelTable() {
				let vm = this
				vm.orderFormVisible = false
			},
		}
		
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
