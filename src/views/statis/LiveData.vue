/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-18 11:29:05
 * @Description:  历史记录
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="小区">
					<el-select v-model="listQuery.villageName" clearable placeholder="请选择小区">
						<!-- <el-option 
						v-for="item in alarmList"
						:key="item.dictCode"
						:label="item.dictName"
						:value="item.dictCode">
						</el-option> -->
					</el-select>
				</el-form-item>
				<el-form-item label="住户编号">
					<el-input v-model="listQuery.householdCode" placeholder="请输入住户编号" clearable></el-input>
				</el-form-item>
				<el-form-item label="条形码" class="barCode">
					<el-input v-model="listQuery.barCode" placeholder="请输入条形码" clearable></el-input>
				</el-form-item>
				<el-form-item label="上报时间" >
					<date-time-picker v-model="listQuery.time" ref="datePicker" :isTodayBefore="true"></date-time-picker>
				</el-form-item>
				
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-if="!permBtn.car_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="userName"></el-table-column>
			<el-table-column align="center" label="电话" prop="phone"></el-table-column>
		    <el-table-column align="center" label="小区" prop="villageName"></el-table-column>
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
	import Pagination from '../../components/Pagination';
	import DateTimePicker from '../../components/DateTimePicker';//日期组件

	export default {
		components: {
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
			
		},
		watch: {
			
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
		        vm.$instance.get("/proxy/statis/findLiveData", {params:param}).then(res =>{	
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
      		
      		//导出
      		exportFormLists() {
				utils.exportLists(this.listQuery, "/proxy/bizmgr/car/export");
      		},  
		}
		
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
