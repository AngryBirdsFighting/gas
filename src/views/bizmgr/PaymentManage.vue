/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: zhipeng qiao
 * @Last Modified time: 2019-01-21 20:27:37
 * @Description:  缴费管理
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="条形码">
					<el-input v-model="listQuery.barCode" placeholder="请输入条形码" clearable></el-input>
				</el-form-item>
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
				
				<el-form-item>
					<el-button class="filter-item btnColor" type="primary" icon="el-icon-search" @click="(getList(true))">查询</el-button>
				</el-form-item>
			</el-form>
		</div>
		
		<!-- 表格 -->
		<el-table ref="multipleTable" :data="list" :height="height" fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="name"></el-table-column>
			<el-table-column align="center" label="住户编号" prop="householdCode"></el-table-column>
			<el-table-column align="center" label="电话" prop="phone"></el-table-column>
		    <el-table-column align="center" label="小区" prop="villageName"></el-table-column>
			<el-table-column align="center" label="条形码" prop="barCode"></el-table-column>
			<el-table-column align="center" label="表类型" >
				<template slot-scope="scope">
					<div v-if="!scope.row.gasMeterType">--</div>
				</template>
			</el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button class="btn payment" size="small" @click="handlePayment(scope.$index, scope.row)" title="缴费"></el-button>
					<el-button class="btn sales" size="small" @click="handleSalesGas(scope.$index, scope.row)" title="售气"></el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页 -->
		<pagination ref="page" :total="total" @reLoadData="paginationChange"></pagination>
		
		<!--售气弹窗-->
		<el-dialog title="售气" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="salesGasFormVisible" top="10%" width="488px"  height="280px" lock-scroll class="boxres">
			<el-form class="small-space sales-gas" :model="saleGasQuery" ref="bindEquImeiForm"  label-position="left" label-width="140px" element-loading-text="拼命加载中">
				<el-form-item label="购气金额：">
				    <el-input v-model="saleGasQuery.lumpSum" placeholder="购气金额"></el-input>
			   	</el-form-item>
				   <el-form-item label="购气气量：">
				    <el-input disabled  v-model="saleGasQuery.lumpSum" placeholder="购气气量"></el-input>
			   	</el-form-item>
				   <el-form-item label="单价：">
				    <el-input disabled  v-model="saleGasQuery.price" placeholder="单价"></el-input>
			   	</el-form-item>
				<div class="formButton">
					<el-button @click="closeSalesGasForm">取 消</el-button>
					<el-button type="primary" @click.native.prevent="bindSalesGasSubmit()" class="btnColor">确 定</el-button>
				</div>
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
					carNum: "", 
					name: "", 
					phone: "", 
					villageName: ""
				},
				//售气参数
				saleGasQuery: {
					price: "",
					lumpSum: ""
				},
				salesGasFormVisible: false
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

			//获取列表数据   isBackHome 是否返回首页
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
		        vm.$instance.post("/proxy/household/queryList", param).then(res =>{	
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
			
			//缴费
			handlePayment() {

			},

			//售气
			handleSalesGas() {
				this.salesGasFormVisible = true
			},

			//关闭售气弹框
			closeSalesGasForm() {
				this.salesGasFormVisible = false
			},

			//确定兽气
			bindSalesGasSubmit() {
				this.salesGasFormVisible = false
			},

			resetForm(formName) {
        		if (this.$refs[formName] !== undefined) {
					this.$refs[formName].resetFields();
				}
			},

			/**
			 * 分页改变，加载数据
			 */
			paginationChange(pageData) {
				this.listQuery.iDisplayStart = pageData.iDisplayStart;
				this.listQuery.iDisplayLength = pageData.iDisplayLength;
			},
		}
	}
</script>
<style rel="stylesheet/scss" scope lang="scss">
	.sales-gas .el-input{
		padding: 0;
		width: 80%
	}
</style>
