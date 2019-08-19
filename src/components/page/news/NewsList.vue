<template>
    <div class="table">
        <div class="news-list">
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item><i class="el-icon-lx-cascades"></i> 新闻管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="container">
                <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="addNews" style="margin-bottom: 20px;">新增新闻</el-button>
                <el-table :data="data" border class="table" ref="multipleTable">
                    <el-table-column prop="newsName" label="新闻名称">
                    </el-table-column>
                    <el-table-column label="操作" width="280">
                        <template slot-scope="scope">
                            <el-button @click="editNews(scope.row)">编辑</el-button>
                            <el-button type="danger" @click="handleDelete(scope.row)" class="del-button">删除</el-button>
                        </template>
                    </el-table-column>  
                </el-table>
                <div class="pagination">
                    <el-pagination
                        background
                        @current-change="handleCurrentChange"
                        layout="prev, pager, next"
                        :current-page.sync="curPage"
                        :total="totalCount">
                    </el-pagination>
                </div>
            </div>

            <!-- 删除提示框 -->
            <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
                <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="delVisible = false">取 消</el-button>
                    <el-button type="primary" @click="deleteRow">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import { request } from '../../../api/index';
    import { urlList } from '../../../api/requestUrl';
    export default {
        name: 'newsList',
        data() {
            return {
                totalCount: 0,
                tableData: [],
                curPage: 1,
                pageSize: 10,
                delVisible: false,
                delId: -1,
            }
        },
        computed: {
            data() {
                return this.tableData
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => vm.getNewsList())
        },
        methods: {
            handleCurrentChange(page) {
                this.curPage = page
                this.getNewsList()
            },
            getNewsList() {
                request({ page: this.curPage, pageSize: this.pageSize }, urlList.getNewsList)
                    .then(res => {
                        if (res.code === 200) {
                            this.tableData = res.data.list
                            this.totalCount = res.data.totalCount
                        } else {
                            console.log('获取新闻列表失败，请刷新页面')
                        }
                    })
            },
            addNews() {
                this.$router.push({ path: '/newsdetail?-1'})
            },
            editNews(row) {
                this.$router.push({ path: `/newsdetail?${row.id}`})
            },
            handleDelete(row) {
                this.delId = row.id
                this.delVisible = true
            },
            // 确定删除
            deleteRow(){
                request({ id: this.delId }, urlList.delNews)
                    .then(res => {
                        if (res.code === 200) {
                            this.$message({
                                duration: 600,
                                message: '删除成功!',
                                type: 'success',
                                onClose: () => {
                                    this.getNewsList()
                                }
                            })
                        } else {
                            console.log('删除新闻失败，请重试')
                        }
                        this.delVisible = false
                    })
            }
        }
    }

</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .red{
        color: #ff0000;
    }
    .mr10{
        margin-right: 10px;
    }
    .item {
        margin-top: 0px;
        margin-right: 20px;
    }
    .del-button {
        margin-top: 10px;
    }
</style>
