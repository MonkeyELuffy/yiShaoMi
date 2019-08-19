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
                        <el-upload
                            class="cover-img-uploader"
                            :action="coverImgAction"
                            :show-file-list="false"
                            :on-success="uploadCoverImgSuccess"
                            :before-upload="beforeImgUpload">
                            <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="cover-img">
                            <i v-else class="el-icon-plus cover-img-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="缩略图" prop="littleImageUrl">
                        <el-upload
                            class="little-img-uploader"
                            :action="littleImgAction"
                            :show-file-list="false"
                            :on-success="uploadLittleImgSuccess"
                            :before-upload="beforeImgUpload">
                            <img v-if="form.littleImageUrl" :src="form.littleImageUrl" class="cover-img">
                            <i v-else class="el-icon-plus cover-img-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="新闻标题" prop="newsName">
                        <el-input v-model="form.newsName"></el-input>
                    </el-form-item>
                    <el-form-item label="副标题">
                        <el-input v-model="form.subhead"></el-input>
                    </el-form-item>

                    <el-form-item label="新闻内容">
                        <div class="des-container">
                            <el-upload
                            v-show="false"
                            class="content-img-uploader"
                            :action="contentImgAction"
                            :show-file-list="false"
                            :on-success="uploadContentImgSuccess"
                            :before-upload="beforeImgUpload">
                            </el-upload>
                            <quill-editor
                                ref="quillEditor"
                                v-model="form.content"
                                :options="editorOption"
                                @change="onEditorChange">
                            </quill-editor>
                        </div>
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
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import { request } from '../../../api/index';
    import { urlList, baseURL } from '../../../api/requestUrl';
    
    const defaultFormData = {
        coverImageUrl: '',
        newsName: '',
        subhead: '',
        link: '',
        address: '',
        longitude: '',
        latitude: '',
        star: '',
        community: '',
        content: '',
    }

    export default {
        name: 'newsDetail',
        data: function(){
            return {
                coverImgAction: baseURL + urlList.uploadImage + '?type=cover',
                littleImgAction: baseURL + urlList.uploadImage + '?type=little',
                contentImgAction: baseURL + urlList.uploadImage + '?type=content',
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
                    newsName: [
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
            quillEditor,
        },
        methods: {
            loadPage() {
                this.pageType = '新增'
                const newsId = this.getNewsId()
                if (newsId !== '-1') {
                    this.pageType = '编辑'
                    this.getNewsDetail(newsId)
                } else {
                    this.resetFormData()
                }
            },
            getNewsId() {
                const newsId = location.href.split('?')[1]
                return newsId
            },
            resetFormData() {
                this.form = {
                    coverImageUrl: '',
                    littleImageUrl: '',
                    newsName: '',
                    subhead: '',
                    content: '',
                }
            },
            getNewsDetail(newsId) {
                request({ id: newsId }, urlList.getNewsDetail).then(res => {
                    if (res.code === 200) {
                            this.form = res.data.detail
                        } else {
                            console.log('获取新闻详情失败，请刷新页面')
                        }
                })
            },
            onSubmit(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        const url = this.pageType === '新增' ? urlList.addNews : urlList.editNews
                        request(this.form, url).then(res => {
                            if (res.message === '调用成功') {
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
            uploadCoverImgSuccess(res, file) {
                this.form.coverImageUrl = res.data.imageUrl
            },
            uploadLittleImgSuccess(res, file) {
                this.form.littleImageUrl = res.data.imageUrl
            },
            uploadContentImgSuccess(res, file) {
                let quill = this.$refs.quillEditor.quill;
                if (res.code === 200) {
                    // 获取光标所在位置
                    let length = quill.getSelection().index;
                    // 插入图片
                    quill.insertEmbed(length, "image", res.data.imageUrl);
                    // 调整光标到最后
                    quill.setSelection(length + 1);
                } else {
                    this.$message.error("图片插入失败");
                }
            },
            beforeImgUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 2MB!')
                }
                return isLt2M
            },
            onEditorChange({ editor, html, text }) {
                this.content = html
            },
        }
    }
</script>

<style>
  .little-img-uploader .el-upload {
    width: 180px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .cover-img-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .cover-img-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .cover-img-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .cover-img {
    height: 240px;
    display: block;
  }
  .des-container {
      width: 100%;
  }
</style>
