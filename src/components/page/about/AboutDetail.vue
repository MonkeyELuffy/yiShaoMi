<template>
    <div class="detail-content">
        <div class="container">
            <div class="form-box">
                <el-form ref="form" :model="form" label-width="120px">
                    <el-form-item label="活动介绍">
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
                                @change="onEditorChange"
                                @focus="onEditorFocus($event)"
                                >
                            </quill-editor>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button v-show='pageType !== "edit"' type="primary" @click="onEdit">编辑</el-button>
                        <el-button v-show='pageType === "edit"' type="primary" @click="onSubmit('form')">保存</el-button>
                        <el-button v-show='pageType === "edit"' @click="showDialog">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!-- 返回提示框 -->
        <el-dialog title="提示" :visible.sync="backVisible" width="300px" center>
            <div class="del-dialog-cnt">数据未保存，是否丢弃？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="backVisible = false">取 消</el-button>
                <el-button type="primary" @click="cancelSave">确 定</el-button>
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
        content: '',
    }

    export default {
        name: 'modelDetail',
        data: function(){
            return {
                contentImgAction: baseURL + urlList.uploadImage + '?type=content',
                form: defaultFormData,
                backVisible: false,
                communityList: [],
                modelTypeList: [],
                pageType: '',
                pageSize: 1000,
                editorOption: {
                    placeholder: '在此编辑活动介绍',
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
                this.getAboutDetail()
            },
            resetFormData() {
                this.form = {
                    content: '',
                }
            },
            getAboutDetail() {
                request({}, urlList.getAboutDetail).then(res => {
                    if (res.code === 200) {
                            this.form = res.data.detail
                        }
                })
            },
            onEdit() {
                this.pageType = 'edit'
            },
            onSubmit(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        request(this.form, urlList.editAboutDetail).then(res => {
                            if (res.message === '调用成功') {
                                this.showSuccess()
                            } else {
                                this.$message.error(`编辑失败，请重试`)
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
                    message: '编辑成功!',
                    type: 'success',
                    onClose: () => {
                        this.pageType = ''
                        this.getAboutDetail()
                    }
                })
            },
            showDialog() {
                this.backVisible = true
            },
            cancelSave() {
                this.backVisible = false
                this.pageType = ''
                this.getAboutDetail()
            },
            uploadContentImgSuccess(res, file) {
                let quill = this.$refs.quillEditor.quill;
                if (res.code === 200 && this.pageType === 'edit') {
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
                if ( this.pageType !== 'edit') {
                    this.$message.error("请在编辑模型下添加图片")
                    return false
                } else {
                    const isLt2M = file.size / 1024 / 1024 < 2
                    if (!isLt2M) {
                        this.$message.error('上传图片大小不能超过 2MB!')
                    }
                    return isLt2M
                }
            },
            onEditorChange({ editor, html, text }) {
                this.content = html
            },
            onEditorFocus(editor){
                editor.enable(this.pageType === 'edit')
            },
        }
    }
</script>

<style>
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
