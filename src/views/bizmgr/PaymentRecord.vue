/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-16 14:37:58
 * @Description:  缴费记录
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="住户姓名">
					<el-input v-model="listQuery.name" placeholder="请输入住户姓名" clearable></el-input>
				</el-form-item>
				<el-form-item label="住户电话">
					<el-input v-model="listQuery.phone" placeholder="请输入住户电话" clearable></el-input>
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
				<el-form-item label="缴费时间" >
					<date-time-picker v-model="listQuery.payTime" ref="datePicker" :isTodayBefore="true"></date-time-picker>
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
			<el-table-column align="center" label="电话" prop="phone"></el-table-column>
		    <el-table-column align="center" label="小区" prop="villageName"></el-table-column>
			<el-table-column align="center" label="缴费时间" prop="payTime"></el-table-column>
			<el-table-column align="center" label="缴费金额" prop="money"></el-table-column>
			<el-table-column align="center" label="收银员" prop="people"></el-table-column>
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
				driverTotal: 0,
				listLoading: true,
				height: 540,
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					name: "",
					phone: "",
					villageName: "",
					payTime: ""
				},
				//数据字典
                dictionaries:{
					
				},
			}
		},
		mounted() {
			var vm = this;
			// vm.getPerm();
			vm.getList();
			// vm.getDictionaries();
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
		        vm.$instance.post("/proxy/payment/queryList", param).then(res =>{	
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
			// getDictionaries() {
			// 	var vm = this;
			// 	let arr = ["fuel_type","car_plate_color","car_use","car_brands","car_color"];
			// 	utils.batchDictsByCode(arr, data => {
			// 		vm.dictionaries = data;
			// 	})
			// },
			
			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},
		}
		
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
