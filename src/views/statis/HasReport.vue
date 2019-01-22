/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-18 11:28:40
 * @Description:  用气报表
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
				<el-form-item label="住户名">
					<el-input v-model="listQuery.name" placeholder="请输入住户名" clearable></el-input>
				</el-form-item>
				<el-form-item label="电话">
					<el-input v-model="listQuery.phone" placeholder="请输入电话" clearable></el-input>
				</el-form-item>
				<el-form-item label="统计周期">
					<el-select v-model="listQuery.time" placeholder="请选择周期" @change="changeTime">
						<el-option label="日" value="1"></el-option>
						<el-option label="月" value="0"></el-option>
						<el-option label="年" value="-1"></el-option>
					</el-select>
				</el-form-item>
				
				<el-form-item label="日期" class="width150">
					<el-date-picker v-model="listQuery.date" :type="dateType" placeholder="请选择时间"></el-date-picker>
				</el-form-item>
				
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
				<!-- <el-form-item>
					<el-button v-if="!permBtn.car_export" class="filter-item" type="primary" icon="el-icon-download" @click="exportFormLists">导出</el-button>
				</el-form-item> -->
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="userName"></el-table-column>
			<el-table-column align="center" label="住户编号" prop="phone"></el-table-column>
		    <el-table-column align="center" label="小区" prop="community"></el-table-column>
			<el-table-column align="center" label="用气量/L">
				<template slot-scope="scope">
					<div v-if="!scope.row.gasMeasure">--</div>
				</template></el-table-column>
			<el-table-column align="center" label="统计时间" prop="collectionTime"></el-table-column>
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

	export default {
		components: {
			'pagination': Pagination,
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
					villageName: "",
					householdCode: "",
					name: "",
					phone: "",
					time: "1",
					date: "",	
				},
				dateType: "date",
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
		//实例销毁之间调用。在这一步，实例仍然完全可用
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
		        vm.$instance.get("/proxy/statis/findHistoryData", {params: param}).then( res => {	
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
				// var vm = this;
				// let arr = ["fuel_type","car_plate_color","car_use","car_brands","car_color"];
				// utils.batchDictsByCode(arr, data => {
				// 	vm.dictionaries = data;
				// })
			},

			//改变分页
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
				this.getList();
			},

			//改变统计周期，切换时间组件
			changeTime(value) {
				switch (value) {
					case "1":
						this.dateType = "date"
						this.listQuery.date = ""
						break;
					case "0":
						this.dateType = "month"
						this.listQuery.date = ""
						break;
					case "-1":
						this.dateType = "year"
						this.listQuery.date = ""
						break;
					default:
						this.listQuery.date = ""
						break;
				}
			}
		}
	}
	
</script>
<style rel="stylesheet/scss" scope lang="scss">
	
</style>
