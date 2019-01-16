/**
 * @Author:      qinbb
 * @DateTime:    2018-02-01 09:12:07
 * @Description: 路由配置
 */
import Vue from 'vue';
import Router from 'vue-router';
import store from '../store/index.js';  //状态store
//webpack热加载在开发环境下会很慢，因此只在生产环境下进行懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
/* 布局以及菜单*/
import Layout from '../views/layout/Layout';
/* login 登录找回密码 以及重置密码*/
const Login = _import('login/Index');
/* 个人信息 */
const Personal = _import('login/Personal');
/* 首页 */
const Home = _import('home/home');
/* 错误页面 */
const Err404 = _import('error/404');
const Err401 = _import('error/401');
/*监控服务：告警监控*/
const AlarmMonitor = _import('monitor/AlarmMonitor');
/*监控服务：工单管理*/
const WorkManage = _import('monitor/WorkManage');


/*系统管理：用户/组管理*/
const AccountGroup = _import('sysmgr/AccountGroup');
/*系统管理：角色管理*/
const RoleManage = _import('sysmgr/RoleManage');
/*系统管理：组织机构管理*/
// const DepartManage = _import('sysmgr/DepartManage');


/*运营管理:缴费管理*/
const PaymentManage = _import('bizmgr/PaymentManage');
/*运营管理：缴费记录*/
const PaymentRecord = _import('bizmgr/PaymentRecord');
/*运营管理：IC卡业务*/
const CardBusiness = _import('bizmgr/CardBusiness');


/*报表管理：汇总统计*/
const SummaryData = _import('statis/SummaryData');
/*报表管理：实时数据*/
const LiveData = _import('statis/LiveData');
/*报表管理：历史数据*/
const HistoryData = _import('statis/HistoryData');
/*报表管理：用气报表*/
const HasReport = _import('statis/HasReport');
/*报表管理：营收统计*/
const RevenueData = _import('statis/RevenueData');


/*信息管理：营业网点管理*/
const PointManage = _import('info/PointManage');
/*信息管理：小区管理*/
const VillageManage = _import('info/VillageManage');
/*信息管理：住户管理*/
const HouseholdManage = _import('info/HouseholdManage');
/*信息管理：价格管理*/
const PriceManage = _import('info/PriceManage');
/*信息管理：设备维护人*/
const EquPersonnelManage = _import('info/EquPersonnelManage');

Vue.use(Router);//全局方法 Vue.use() 使用插件
  /**
    * hidden : true不显示在菜单栏
    * redirect : 设置重定向，noredirect是不重定向
    * noDropdown : true 不显示子菜单
    * meta : { role: ['admin'] }  will control the page role
    * children:嵌套路由,component必不可少，先进入父路由
    **/
    const constantRouterMap = [
      //登录、找回密码、重新设置密码、以及401、404
      { path: '/login', component: Login, hidden: true },
      { path: '/error/404', component: Err404, hidden: true },  //假地址时重定向
      { path: '/error/401', component: Err401, hidden: true }, 
      { path: '/home', component: Layout,redirect: 'noredirect',
      name: '首页',   children: [
        { path: '/', component: Home, name: '首页' }]}, 
      
      //路由 /  重定向到首页
      {
        path: '/',
        //redirect: '/lbs/CarGps',  //路由为 / 就重定向到默认首页
        redirect: to => {
          // 方法接收 目标路由 作为参数
          // return 重定向的 字符串路径/路径对
          let paths = "";
          if(store.getters.routerPath && store.getters.routerPath){
            console.log(store.getters.routerPath)
            
            paths =  store.getters.routerPath;
          }else{
            paths = '/user/Personal';
          }
          return paths;
        },
        hidden: true,
      },
      {
        path: '/user',
        component: Layout,
        redirect: 'noredirect',
        name: '位置服务',
        children: [
          { path: 'Personal', component: Personal, name: '个人信息' }
        ]
      },
      {
        path: '/monitor',
        component: Layout,
        redirect: 'noredirect',
        name: '监控服务',
        children: [
          { path: 'AlarmMonitor', component: AlarmMonitor, name: '告警监控' },
          { path: 'WorkManage', component: WorkManage, name: '工单管理' }
        ]
      },{
        path: '/sysmgr',
        component: Layout,
        redirect: 'noredirect',
        name: '系统管理',
        children: [
          { path: 'AccountGroup', component: AccountGroup, name: '用户/组管理' },
          { path: 'RoleManage', component: RoleManage, name: '角色管理' },
          // { path: 'DepartManage', component: DepartManage, name: '组织机构管理' }
        ]
      },{
        path: '/bizmgr',
        component: Layout,
        redirect: 'noredirect',
        name: '运营管理',
        children: [
          { path: 'PaymentManage', component: PaymentManage, name: '缴费管理' },
          { path: 'PaymentRecord', component: PaymentRecord, name: '缴费记录' },
          { path: 'CardBusiness', component: CardBusiness, name: 'IC卡管理' }
        ]
      },{
        path: '/statis',
        component: Layout,
        redirect: 'noredirect',
        name: '统计报表',
        children: [
          { path: 'SummaryData', component: SummaryData, name: '汇总统计' },
          { path: 'LiveData', component: LiveData, name: '实时数据' },
          { path: 'HistoryData', component: HistoryData, name: '历史统计'},
          { path: 'HasReport', component: HasReport, name: '用气报表' },
          { path: 'RevenueData', component: RevenueData, name: '营收统计' }
        ]
      },
      {
        path: '/info',
        component: Layout,
        redirect: 'noredirect',
        name: '信息管理',
        children: [
          { path: 'PointManage', component: PointManage, name: '营业网点管理' },
          { path: 'VillageManage', component: VillageManage, name: '小区管理' },
          { path: 'HouseholdManage', component: HouseholdManage, name: '住户管理'},
          { path: 'PriceManage', component: PriceManage, name: '价格管理' },
          { path: 'EquPersonnelManage', component: EquPersonnelManage, name: '设备维护人' }
        ]
      },
      { path: '*', redirect: '/error/404', hidden: true }
    ];



//创建router 对路由constantRouterMap进行管理
export default new Router({
  mode: 'hash',  //开启history模式保证spa可以和以前的网页一样可以前进和后退  hash
  scrollBehavior: () => ({ y: 0 }),  //路由跳转保持原先的滚动位置，支持 history.pushState 的浏览器中可用。
  routes: constantRouterMap  //嵌套路由组
});





