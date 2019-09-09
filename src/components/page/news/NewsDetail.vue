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
                            :show-file-list="false"
                            :on-change="changeCoverImgSuccess"
                            :auto-upload="false">
                            <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="cover-img">
                            <i v-else class="el-icon-plus cover-img-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="缩略图" prop="littleImageUrl">
                        <el-upload
                            class="little-img-uploader"
                            :show-file-list="false"
                            :on-change="changeLittleImgSuccess"
                            :auto-upload="false">
                            <img v-if="form.littleImageUrl" :src="form.littleImageUrl" class="cover-img">
                            <i v-else class="el-icon-plus cover-img-uploader-icon"></i>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="新闻标题" prop="title">
                        <el-input v-model="form.title"></el-input>
                    </el-form-item>
                    <el-form-item label="副标题">
                        <el-input v-model="form.subhead"></el-input>
                    </el-form-item>

                    <el-form-item label="新闻内容">
                        <div class="des-container">
                            <el-upload
                            v-show="false"
                            class="content-img-uploader"
                            :show-file-list="false"
                            :on-change="changeContentImgSuccess"
                            :auto-upload="false">
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
<script src="http://cdn.bootcss.com/blueimp-md5/1.1.0/js/md5.min.js"></script>
<script>
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import { quillEditor } from 'vue-quill-editor';
    import { request } from '../../../api/index';
    import { checkMD5, uploadImage } from '../../../utils/utils';
    import { urlList, baseFileURL } from '../../../api/requestUrl';
    import crypto from 'crypto';
    
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
            onEditorChange({ editor, html, text }) {
                this.content = html
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
            changeCoverImgSuccess(file) {
                this.changeImgSuccess(file, 'cover')
            },
            changeLittleImgSuccess(file) {
                this.changeImgSuccess(file, 'little')
            },
            changeContentImgSuccess(file) {
                this.changeImgSuccess(file, 'content')
            },
            changeImgSuccess(file, imgType) {
                const isLt2M = file.size / 1024 / 1024 < 1
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 1MB!')
                    return false
                }

                // 检查图片是否已存在于服务器
                this.checkMD5(file.raw, imgType)
            },
            checkMD5(file, imgType) {
                const that = this
                const timestamp = Date.parse(new Date())/1000
                let md5 = crypto.createHash("md5")
                md5.update('key1=QINYUANMAO&timestamp=' + timestamp + '&key2=FILE_SERVER_2019')
                const sign = md5.digest('hex').toUpperCase()
                // 头部加签
                const headers = {
                    timestamp,
                    sign,
                }
                checkMD5(file, headers).then(response => {
                    const { res, md5 } = response
                    if (res.code === 1) {
                        // 服务器不存在图片，再调用图片上传接口
                        uploadImage(file, headers, md5).then(res => {
                            that.uploadImgSuccess(res.result.fileUrl, imgType)
                        })
                    } else {
                        // 服务器已存在图片，则直接返回图片地址
                        that.uploadImgSuccess(res.result.fileUrl, imgType)
                    }
                })
            },
            uploadImgSuccess(fileUrl, imgType) {
                switch (imgType) {
                    case "cover": 
                        this.uploadCoverImgSuccess(fileUrl)
                        return
                    case "little": 
                        this.uploadLittleImgSuccess(fileUrl)
                        return
                    case "content": 
                        this.uploadContentImgSuccess(fileUrl)
                        return
                }
            },
            uploadCoverImgSuccess(fileUrl) {
                this.form.coverImageUrl = fileUrl
            },
            uploadLittleImgSuccess(fileUrl) {
                this.form.littleImageUrl = fileUrl
            },
            uploadContentImgSuccess(fileUrl) {
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
