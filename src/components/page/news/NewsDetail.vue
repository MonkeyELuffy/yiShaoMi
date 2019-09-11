<template>
    <div class="detail-content">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> {{pageType}}模型</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" :rules="rules" label-width="120px">

                    <el-form-item label="封面图" prop="coverImageUrl">
                        <img-uploader :imageUrl="form.coverImageUrl" @changeImg='changeCoverImg'></img-uploader>
                    </el-form-item>

                    <el-form-item label="缩略图" prop="littleImageUrl">
                        <img-uploader :imageUrl="form.littleImageUrl" @changeImg='changeLittleImg'></img-uploader>
                    </el-form-item>

                    <el-form-item label="新闻标题" prop="title">
                        <el-input v-model="form.title"></el-input>
                    </el-form-item>

                    <el-form-item label="副标题">
                        <el-input v-model="form.subhead"></el-input>
                    </el-form-item>

                    <el-form-item label="新闻内容">
                        <quill-editor-content :content="form.content" @onEditorChange='onEditorChange'></quill-editor-content>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="onSubmit('form')">保存</el-button>
                        <el-button @click="showDialog">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!-- 返回提示框 -->
        <el-dialog title="提示" :visible.sync="backVisible" width="300px" center>
            <div class="del-dialog-cnt">数据未保存，是否返回？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="backVisible = false">取 消</el-button>
                <el-button type="primary" @click="goBack">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import { request } from '../../../api/index';
    import { checkMD5, uploadImage } from '../../../utils/utils';
    import { urlList, baseFileURL } from '../../../api/requestUrl';
    import crypto from 'crypto';
    import imgUploader from '../../common/imgUploader.vue';
    import quillEditorContent from '../../common/quillEditorContent.vue';
    
    const defaultFormData = {
        coverImageUrl: '',
        littleImageUrl: '',
        title: '',
        subhead: '',
        content: '',
    }

    export default {
        name: 'newsDetail',
        data: function(){
            return {
                form: defaultFormData,
                backVisible: false,
                pageType: '新增',
                rules: {
                    coverImageUrl: [
                        { required: true, message: '请上传封面图', trigger: 'blur' }
                    ],
                    littleImageUrl: [
                        { required: true, message: '请上缩略图', trigger: 'blur' }
                    ],
                    title: [
                        { required: true, message: '请输入新闻标题', trigger: 'blur' },
                    ],
                },
                editorOption: {
                    placeholder: '在此编辑新闻内容',
                    modules: {
                        toolbar: {
                            container: [
                                ["image"]
                            ],
                            handlers: {
                                image: value => {
                                    // 触发input框(el-upload渲染出来的)选择图片文件
                                    document.querySelector(".content-img-uploader input").click()
                                },
                            }
                        },
                    }
                },
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => vm.loadPage())
        },
        components: {
            imgUploader,
            quillEditorContent,
        },
        methods: {
            loadPage() {
                this.pageType = '新增'
                this.$refs['form'].resetFields()
                const newsId = this.getNewsId()
                if (newsId !== '-1') {
                    this.pageType = '编辑'
                    this.getNewsDetail(newsId)
                } else {
                    this.resetFormData()
                }
            },
            onEditorChange(html) {
                this.form.content = html
            },
            getNewsId() {
                const newsId = location.href.split('?')[1]
                return newsId
            },
            resetFormData() {
                this.form = {
                    coverImageUrl: '',
                    littleImageUrl: '',
                    title: '',
                    subhead: '',
                    content: '',
                }
            },
            getNewsDetail(newsId) {
                request({ newsId }, urlList.getNewsDetail).then(res => {
                    if (res.code === 0) {
                            this.form = res.result
                        } else {
                            this.$message.error('获取新闻详情失败，请刷新页面')
                        }
                })
            },
            onSubmit(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        const url = this.pageType === '新增' ? urlList.addNews : urlList.editNews
                        request(this.form, url).then(res => {
                            if (res.code === 0) {
                                this.showSuccess()
                            } else {
                                this.$message.error(`${this.pageType}失败，请重试`)
                            }
                        })
                    } else {
                        this.$message.error('请填写完整信息')
                        return false
                    }
                })
            },
            showSuccess() {
                this.$message({
                    duration: 1000,
                    message: '提交成功!',
                    type: 'success',
                    onClose: () => {
                        this.goBack()
                    }
                })
            },
            showDialog() {
                this.backVisible = true
            },
            goBack() {
                this.backVisible = false
                this.$router.push({name: 'newslist'});
            },
            changeCoverImg(fileUrl) {
                this.form.coverImageUrl = fileUrl
            },
            changeLittleImg(fileUrl) {
                this.form.littleImageUrl = fileUrl
            },
            changContentImg(fileUrl) {
                let quill = this.$refs.quillEditor.quill;
                // 获取光标所在位置
                let length = quill.getSelection().index;
                // 插入图片
                quill.insertEmbed(length, "image", fileUrl);
                // 调整光标到最后
                quill.setSelection(length + 1);
            },
        }
    }
</script>
