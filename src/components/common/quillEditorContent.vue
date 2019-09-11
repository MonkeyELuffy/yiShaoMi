<template>
    <div class="des-container">
        <el-upload
        v-show="false"
        class="content-img-uploader"
        :show-file-list="false"
        :on-change="onChangeImg"
        :auto-upload="false">
        </el-upload>
        <quill-editor
            ref="quillEditor"
            v-model="content"
            :options="editorOption"
            @change="onEditorChange">
        </quill-editor>
    </div>
</template>

<script>
    /**
     * content: 子组件和父组件之间的绑定数据
     * onEditorChange: 子组件向父组件返回content
     * for-example: <quill-editor-content :content="form.content" @onEditorChange='onEditorChange'></quill-editor-content>
     */
    import 'quill/dist/quill.snow.css';
    import { quillEditor } from 'vue-quill-editor';
    import { request } from '../../api/index';
    import { checkMD5, uploadImage } from '../../utils/utils';
    import { urlList, baseFileURL } from '../../api/requestUrl';
    
    export default {
        props: {
            content: {
                type: String
            },
        },
        data: function(){
            return {
                editorOption: {
                    placeholder: '在此编辑内容',
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
        components: {
            quillEditor,
        },
        methods: {
            onEditorChange({ editor, html, text }) {
                this.$emit('onEditorChange', html)
            },
            onChangeImg(file) {
                const that = this
                const isLt2M = file.size / 1024 / 1024 < 1
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 1MB!')
                    return false
                }

                // 检查图片是否已存在于服务器
                checkMD5(file.raw).then(response => {
                    const { res, md5 } = response
                    if (res.code === 1) {
                        // 服务器不存在图片，再调用图片上传接口
                        uploadImage(file.raw, md5).then(res => {
                            that.changeContentImg(res.result.fileUrl)
                        })
                    } else {
                        // 服务器已存在图片，则直接返回图片地址
                        that.changeContentImg(res.result.fileUrl)
                    }
                })
            },
            changeContentImg(fileUrl) {
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
