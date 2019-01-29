/*
 * @Author: Wang Chao 
 * @Date: 2019-01-16 13:50:55 
 * @Last Modified by: Wang Chao
 * @Last Modified time: 2019-01-18 11:30:35
 * @Description:  汇总统计
 */

<template>
	<div class="app-container">
		<!-- 搜索条件 -->
		<div class="filter-container">
			<el-form :inline="true" :model="listQuery" class="demo-form-inline">
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
			</el-form>
		</div>
		<div v-bind:style="{height: height}">
			<div class="mileDayLine" id="alarmDayLine" style="height:750px;"></div>
		</div>
		
		
	</div>
</template>

<script>
	import "../../assets/css/index.scss";
	import { Message } from 'element-ui';
	import { validate } from 'utils/validate';
	import { utils } from 'src/utils';
	import DateTimePicker from '../../components/DateTimePicker';//日期组件
	import initEcharts  from 'src/utils/initEchart';

	export default {
		components: {
			'date-time-picker': DateTimePicker ,//日期组件
		 },
		data() {
			return {
				//按钮的权限 查询query 新增add   true 显示  false 隐藏
				permBtn:{
	                
				},
				height: "",
				//列表查询参数
				listQuery: {
					iDisplayLength: 10,
					iDisplayStart: 0,
					time: "",
					date: "",
				},
				dateType: "date",
			}
		},
		mounted() {
			var vm = this;
			// vm.getPerm();
			// vm.getDictionaries();
			vm.drawEcharts();
			this.$nextTick(function(){
				utils.getTableHeight((height)=>{
					this.height = height + 20 + 'px';
				});
			})
		},
		//实例销毁之间调用。在这一步，实例仍然完全可用。   时间定时器
		beforeDestroy(){
			
		},
		watch: {
			
		},
		methods: {
			//画折线图
			drawEcharts() {
				const vm = this;
				initEcharts().then(echarts => {
					let myCharts = echarts.init(document.getElementById('alarmDayLine'));
					let xData = ['10.01', '10.02', '10.03', '10.04', '10.05', '10.06', '10.07', '10.08', '10.09', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '10.16',
						'10.17', '10.18', '10.19', '10.20'];
					let yData = [80000, 98000, 100000, 90000, 89000, 92763, 90873, 98078, 89078, 98076, 81908, 93809, 100000, 98087, 89076, 98765, 97642, 90897, 113890, 98909];
					var option = {
						title: {
							text: '日用气量图表',
							x: 'center'
						},
						color: ['#0600ff'],
						tooltip: {
							trigger: 'axis'
						},
						grid: {
							left: '3%',
							right: '4%',
							bottom: '3%',
							containLabel: true
						},
						toolbox: {
							feature: {
								saveAsImage: {}
							}
						},
						xAxis: {
							type: 'category',
							boundaryGap: false,
							data: xData
						},
						yAxis: {
							type: 'value',
							name: '用气量(L)'
						},
						series: [{
							smooth: true,
							name: '用气量',
							type: 'line',
							stack: '总量',
							symbolSize: 12,
							areaStyle: {
								normal: {
									color: new echarts.graphic.LinearGradient(
										0, 0, 0, 1, [{
												offset: 0,
												color: '#9bf3f1'
											},
											{
												offset: 0.7,
												color: '#188df0'
											},
											{
												offset: 1,
												color: '#abb9f4'
											}
										]
									)
								}
							},
							itemStyle: {
								normal: {
									lineStyle: {
										width: 3// 0.1的线条是非常细的了
									}
								}
							},
							data: yData
						}]
					};
					myCharts.setOption(option, true);
				})
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
