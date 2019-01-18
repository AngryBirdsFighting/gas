/*
 * @Author: qiaozp 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: qiaozp
 * @Last Modified time: 2019-01-16 14:33:54
 * @Description:  告警监控
 */

<template>
	<div class="app-container">
		
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
				<el-form-item label="住户姓名">
					<el-input v-model="listQuery.equImei" placeholder="请输入住户姓名" clearable></el-input>
				</el-form-item>
				<el-form-item label="住户编号">
					<el-input v-model="listQuery.equImei" placeholder="请输入住户编号" clearable></el-input>
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
				<el-form-item label="告警类型">
					<el-select v-model="listQuery.powerType" clearable placeholder="请选择告警类型">
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
		<el-table ref="multipleTable" :data="list" :height="height"  fit highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中">
			<el-table-column align="center" label='住户名' prop="carNum"></el-table-column>
			<el-table-column align="center" label="住户编号" prop="deptName"></el-table-column>
		    <el-table-column align="center" label="小区" prop="carBrand"></el-table-column>
			<el-table-column align="center" label="告警类型" prop="carModel"></el-table-column>
			<el-table-column align="center" label="告警时间" prop="powerType"></el-table-column>
			<el-table-column align="center" label="操作" width="150">
				<template slot-scope="scope">
					<el-button v-if="!permBtn.group_check" class="btn check" size="small" @click="check(scope.$index, scope.row)" title="派发"></el-button>
					<el-button v-if="!permBtn.group_modify" class="btn update" size="small" @click="handleEdit(scope.$index, scope.row)" title="忽略"></el-button>
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
