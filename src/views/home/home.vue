/** * @Author: qinbb 
 * *  @DateTime: 2018-03-21 15:30:52 
 * 	  @Description: 个人信息组件 
 */
<template>
	<div class="app-container personal-view" :style="{  height: tableHeight + 'px' }">
		<el-row :gutter="24">
			<el-col :span="24">
				<div class="user_info">
					<h2>我是首页</h2>
					<div id="carGps" class="mapTrail" style="height: 500px"></div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import "../../assets/css/index.scss";

	var echarts = require('echarts');

	export default {
		data() {
			return {
				heightData: 540

			}
		},
		computed: {
			...mapGetters([
				// 映射 userInfo
				'userInfo',	
			]),
			mapState () {
				return this.$store.state.user.mapState
			},
			// 计算属性的 getter
			tableHeight: function() {
				// `this` 指向 vm 实例
				let height = document.documentElement.offsetHeight || document.body.offsetHeight;
				this.heightData = height;
				return this.heightData;
			}
		},
		watch: {
			mapState: function(newV, oldV){
                if(this.$store.state.user.mapState){
                    this.initMap()
				}
			}
		},
		mounted() {
			let routers = this.$store.getters.permission_routers;//获取当前用户的菜单
			if (routers.length == 0) {
				$('.personal-view').css('margin-left', '10px');
			} else{
				$('.personal-view').css('margin-left', '220px');
			}
			if(this.mapState){
				this.initMap();//初始化地图
			}
		},
		methods: {
			initMap() {
				var vm = this;
				// 百度地图API功能
				vm.map = new BMap.Map("carGps");    // 创建Map实例
				vm.map.centerAndZoom("北京", 5);  // 初始化地图,设置中心点坐标和地图级别
				vm.map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
				vm.map.enableScrollWheelZoom();     //开启鼠标滚轮缩放				
			},
		}
	};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
	.user_info {
		border: 1px solid #dee1e2;
		h2 {
			margin: 0;
			font-weight: normal;
			padding: 10px 20px;
			border-bottom: 1px solid #dee1e2;
			.i_edit {
				float: right;
				font-size: 16px;
				color: #7ab8ed;
			}
		}
	}
	
	.user_info_form,
	.user_info_text {
		padding: 20px;
	}
	
	.el-form-item {
		margin-bottom: 0;
	}
</style>