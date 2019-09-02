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
                            :show-file-list="false"
                            :on-change="changeContentImgSuccess"
                            :auto-upload="false">
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
    import { urlList, baseFileURL } from '../../../api/requestUrl';
    import crypto from 'crypto';
    import sMD5 from '../../../utils/spark-md5';
    
    const defaultFormData = {
        content: '',
    }

    export default {
        name: 'modelDetail',
        data: function(){
            return {
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
                    if (res.code === 0) {
                        this.form = res.result
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
                            if (res.code === 0) {
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
            uploadContentImgSuccess(fileUrl) {
                let quill = this.$refs.quillEditor.quill;
                // 获取光标所在位置
                let length = quill.getSelection().index;
                // 插入图片
                quill.insertEmbed(length, "image", fileUrl);
                // 调整光标到最后
                quill.setSelection(length + 1);
            },
            uploadImgSuccess(fileUrl, imgType) {
                this.uploadContentImgSuccess(fileUrl)
            },
            onEditorChange({ editor, html, text }) {
                this.content = html
            },
            onEditorFocus(editor){
                editor.enable(this.pageType === 'edit')
            },
            changeContentImgSuccess(file) {
                this.changeImgSuccess(file, 'content')
            },
            changeImgSuccess(file, imgType) {
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 2MB!')
                }
                const timestamp = Date.parse(new Date())/1000
                let md5 = crypto.createHash("md5")
                md5.update('key1=QINYUANMAO&timestamp=' + timestamp + '&key2=FILE_SERVER_2019')
                const sign = md5.digest('hex').toUpperCase()
                const headers = {
                    timestamp,
                    sign,
                }
                if (this.pageType === 'edit') {
                    this.getMD5(file.raw, headers, imgType)
                } else {
                    this.$message.error("请在编辑模型下添加图片")
                }
            },
            getMD5(file, headers, imgType) {
                const that = this
                let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                    chunkSize = 8097152, // Read in chunks of 2MB
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0,
                    spark = new SparkMD5.ArrayBuffer(),
                    fileReader = new FileReader();

                fileReader.onload = function(e) {
                    spark.append(e.target.result) // Append array buffer
                    currentChunk++
                    let md5_progress = Math.floor((currentChunk / chunks) * 100)
                    if (currentChunk < chunks) {
                        loadNext()
                    } else {
                        let tmp_md5 = spark.end()
                        let formData = new FormData()
                        formData.append("md5", tmp_md5)
                        const upFileQuery = {
                            headers,
                            needChangeUrl: true,
                            url: baseFileURL + urlList.testMD5,
                        }
                        // md5验证，若是后台已有图片数据，则直接返回结果
                        // 若后台无此图片，则调用uploadImage接口
                        request(formData, urlList.testMD5, upFileQuery).then(res => {
                            if (res.code === 1) {
                                that.uploadImage(file, headers, tmp_md5, imgType)
                            } else {
                                that.uploadImgSuccess(res.result.fileUrl, imgType)
                            }
                        })
                    }
                };
                fileReader.onerror = function() {
                    console.warn('oops, something went wrong.')
                };
                function loadNext() {
                    let start = currentChunk * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
                    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
                }
                loadNext()
            },
            uploadImage(file, headers, md5, imgType) {
                const that = this
                var reader = new FileReader()
                reader.onload = e => {
                    const imgurl = e.target.result
                    let formData = new FormData()
                    var blobBin = that.dataURLtoBlob(imgurl)
                    var fileType = blobBin.type.split("/")[1]
                    formData.append('file', blobBin)
                    formData.append("md5", md5)
                    //上传数据
                    const upFileQuery = {
                        headers,
                        needChangeUrl: true,
                        url: baseFileURL + urlList.uploadImage,
                    }
                    request(formData, urlList.uploadImage, upFileQuery).then(res => {
                        that.uploadImgSuccess(res.result.fileUrl, imgType)
                    })
                }
                reader.readAsDataURL(file)
            },
            dataURLtoBlob(imgurl) {
                var arr = imgurl.split(',')
                var mime = arr[0].match(/:(.*?);/)[1]// 结果：   image/png
                var bstr = atob(arr[1].replace(/\s/g, ''))
                var n = bstr.length
                var u8arr = new Uint8Array(n)
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                return new Blob([u8arr], {type: mime})//值，类型
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
