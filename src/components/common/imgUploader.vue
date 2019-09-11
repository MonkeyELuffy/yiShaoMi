<template>
    <el-upload
        class="img-uploader"
        :show-file-list="false"
        :on-change="onChangeImg"
        :auto-upload="false">
        <img v-if="imageUrl" :src="imageUrl" class="cover-img">
        <i v-else class="el-icon-plus img-uploader-icon"></i>
    </el-upload>
</template>

<script>
    /**
     * imageUrl: 子组件和父组件之间的绑定数据
     * changeImg: 子组件向父组件返回imageUrl
     * for-example: <img-uploader :imageUrl="form.coverImageUrl" @changeImg='changeCoverImg'></img-uploader>
     */
    import { request } from '../../api/index';
    import { checkMD5, uploadImage } from '../../utils/utils';
    import { urlList, baseFileURL } from '../../api/requestUrl';

    export default {
        props: {
            imageUrl: {
                type: String
            },
        },
        methods: {
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
                            that.$emit('changeImg', res.result.fileUrl)
                        })
                    } else {
                        // 服务器已存在图片，则直接返回图片地址
                        that.$emit('changeImg', res.result.fileUrl)
                    }
                })
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
  .img-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .img-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .img-uploader-icon {
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
</style>
