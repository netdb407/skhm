<template lang="html" >
<ValidationObserver ref="obs">
  <transition name="tab-fade">
    <v-card class="pa-3" v-show="settingBoxSeen" :value="workloadData" >
      <v-form ref="form" @submit.prevent="submit">

        <v-tabs v-model="active" slider-color="orange" ref="tabs">
          <v-tab href="#tab-1">기본설정</v-tab>
          <v-tab href="#tab-2">사용자비율설정</v-tab>
          <v-tab href="#tab-3">기타설정</v-tab>

          <!--tab-1. 기본설정-->
          <v-tab-item value="tab-1" transition="slide-x-transition">
            <v-card flat>
              <v-form ref="form" v-model="valid">
                <v-container ma-1>
                  <v-layout row wrap>
                    <!--워크로드 이름-->
                    <v-flex xs12 md7>
                      <v-text-field v-model="workloadData.w_name" label="*워크로드 이름(필수)" :rules="nameRules" required />
                    </v-flex>

                    <!-- <VTextFieldWithValidation rules="required|max:10" v-model="name" :counter="10" label="Name" /> -->


                    <!--파일크기 설정-->
                    <v-flex shrink xs12 md7>
                      <v-slider :value="slider"
                                label="Data Size 설정"
                                v-model="slider"
                                :min="0"
                                :max="256"
                                thumb-label />
                    </v-flex>
                    <v-flex xs12 md2>
                      <v-text-field v-model="slider" class="mt-0" hide-details single-line type="number" />
                    </v-flex>
                    <v-flex xs12 md3>
                      <v-form ref="form" v-model="fileSizeValid" lazy-validation>
                        <v-select v-model="fileSizeModel" label="크기" :items="fileSize" required height="27" />
                      </v-form>
                    </v-flex>
                    <!--Record Count-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.recordcount"
                                    label="Record Count"
                                    type="number"
                                    :min="1"
                                    :rules="minusRules"
                                    mask="##########"
                                    required />
                    </v-flex>
                    <!--Operation Count-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.operationcount"
                                    label="Operation Count"
                                    type="number"
                                    :min="1"
                                    :rules="minusRules"
                                    mask="##########" />
                    </v-flex>
                    <!--스레드 수-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.threadcount" label="스레드수" type="number" :min="1" :rules="minusRules"
                      mask="###"/>
                    </v-flex>
                    <!--requestdistribution-->
                    <v-flex xs12 md12>
                      <v-select v-model="workloadData.propValues.requestdistribution"
                                label="requestdistribution"
                                :items="distribution"
                                required />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-form>
            </v-card>
          </v-tab-item>
          <!--/tab-1. 기본 설정-->

          <!--tab-2. 사용자 비율 설정-->
          <v-tab-item value="tab-2" transition="slide-x-transition">
            <v-card flat>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-container ma-1>
                  <v-layout row wrap>
                    <!--1.read-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-text-field v-model="workloadData.propValues.readproportion"
                                    label="read"
                                    type="number"

                                    :rules="operSizeRules"
                                    :min="0"
                                    :max="100"
                                    hint="총 합은 100이 되어야 합니다." />
                    </v-flex>
                    <v-btn icon @click="tab2ReadShow = !tab2ReadShow">
                      <v-icon>{{ tab2ReadShow ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}}</v-icon>
                    </v-btn>
                    <!--1.read 숨김속성-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-slide-x-transition>
                        <v-flex xs12 v-show="tab2ReadShow">
                          <v-switch v-model="workloadData.propValues.readallfields" :label="`readAllFields : ${workloadData.propValues.readallfields.toString()}`"></v-switch>
                        </v-flex>
                      </v-slide-x-transition>
                    </v-flex>
                    <!--/1.read 숨김속성-->
                    <!--/1.read-->

                    <!--2.update-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-text-field v-model="workloadData.propValues.updateproportion"
                                    label="Update"
                                    type="number"
                                    :min="0"
                                    :max="100"
                                    hint="총 합은 100이 되어야 합니다."
                                    :rules="operSizeRules" />
                    </v-flex>
                    <v-flex xs12 sm12 md5 xl5>
                    </v-flex>
                    <!--/2.update-->

                    <!--3.insert-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-text-field v-model="workloadData.propValues.insertproportion"
                                    label="Insert"
                                    type="number"
                                    :min="0"
                                    :max="100"
                                    hint="총 합은 100이 되어야 합니다."
                                    :rules="operSizeRules" />

                    </v-flex>
                    <v-btn icon @click="tab2InsertShow = !tab2InsertShow">
                      <v-icon>{{ tab2InsertShow ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}}</v-icon>
                    </v-btn>
                    <!--3.insert 숨김속성-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-slide-x-transition>
                        <v-flex xs12 v-show="tab2InsertShow">
                          <v-switch v-model="workloadData.propValues.writeallfields" :label="`writeAllFields : ${workloadData.propValues.writeallfields.toString()}`"></v-switch>
                          <v-text-field v-model="workloadData.propValues.insertstart"
                                        label="insertStart"
                                        class="purple-input"
                                        type="number"
                                        :rules="minusRules"
                                        mask="########" />
                          <v-text-field v-model="workloadData.propValues.insertcount"
                                        label="insertCount"
                                        class="purple-input"
                                        type="number"
                                        :rules="minusRules"
                                        mask="########" />
                          <v-select v-model="workloadData.propValues.insertorder" label="insertOrder" :items="insertOrder" required />
                        </v-flex>
                      </v-slide-x-transition>
                    </v-flex>
                    <!--/3.insert 숨김속성-->
                    <!--/3.insert-->

                    <!--4.scan-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-text-field v-model="workloadData.propValues.scanproportion"
                                    label="Scan"
                                    class="purple-input"
                                    type="number"
                                    :min="0"
                                    :max="100"
                                    hint="총 합은 100이 되어야 합니다."
                                    :rules="operSizeRules" />
                    </v-flex>
                    <v-btn icon @click="tab2ScanShow = !tab2ScanShow">
                      <v-icon>{{ tab2ScanShow ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</v-icon>
                    </v-btn>
                    <!--4.scan 숨김속성-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-slide-x-transition>
                        <v-flex xs12 v-show="tab2ScanShow">
                          <v-text-field v-model="workloadData.propValues.minscanlength"
                                        label="minScanLength"
                                        class="purple-input"
                                        type="number"
                                        :rules="minusRules"
                                        mask="########" />
                          <v-text-field v-model="workloadData.propValues.maxscanlength"
                                        label="maxScanLength"
                                        class="purple-input"
                                        type="number"
                                        :rules="minusRules"
                                        mask="########" />
                          <v-select v-model="workloadData.propValues.scanlengthdistribution"
                                    label="scanlengthdistribution"
                                    :items="distribution"
                                    default=true
                                    required />
                        </v-flex>
                      </v-slide-x-transition>
                    </v-flex>
                    <!--/4.scan 숨김속성-->
                    <!--/4.scan-->

                    <!--5.ReadModifyWrite-->
                    <v-flex xs8 sm12 md5 xl5>
                      <v-text-field v-model="workloadData.propValues.readmodifywriteproportion"
                                    label="ReadModifyWrite"
                                    class="purple-input"
                                    type="number"
                                    :min="0"
                                    :max="100"
                                    hint="총 합은 100이 되어야 합니다."
                                    :rules="operSizeRules" />
                    </v-flex>
                    <v-flex xs12 sm12 md5 xl12>
                    </v-flex>
                    <!--/5.ReadModifyWrite-->

                    <!--Total-->
                    <v-flex xs12 sm12 md12 xl12>
                      <v-card flat color="grey lighten-4">
                        <v-layout col wrap justify-center>
                          <v-flex xs8 sm12 md8 xl10 ma-2>
                            <v-text-field
                              :value="calculateTotal"
                              prepend-icon="pie_chart"
                              label="Total"
                              class="purple-input"
                              type="number"
                              :min="0"
                              :max="100"
                              :rules="operSaveRules"
                              disabled />
                          </v-flex>
                          <!-- <v-btn color="primary">유효성 검사</v-btn> -->
                        </v-layout>
                      </v-card>
                    </v-flex>
                    <!--/Total-->

                  </v-layout>
                </v-container>
              </v-form>
            </v-card>
          </v-tab-item>
          <!--/tab-2. 사용자 비율 설정-->

          <!--tab-3. 기타설정-->
          <v-tab-item value="tab-3" transition="slide-x-transition">
            <v-card flat>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-container ma-1>
                  <v-layout row wrap>
                    <!--FieldCount-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.fieldcount" label="fieldcount" type="number" :min="1" :rules="minusRules" mask="####"/>
                    </v-flex>
                    <!--fieldlength-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.fieldlength" label="fieldlength" type="number" :min="1" :rules="minusRules" mask="####" />
                    </v-flex>
                    <!--minfieldlength-->
                    <v-flex xs12 md4>
                      <v-text-field v-model="workloadData.propValues.minfieldlength" label="minfieldlength" type="number" :min="1" :rules="minusRules" mask="####" />
                    </v-flex>
                    <!--fieldnameprefix-->
                    <v-flex xs12 md6>
                      <v-text-field v-model="workloadData.propValues.fieldnameprefix" label="fieldnameprefix" />
                    </v-flex>
                    <!--zeropadding-->
                    <v-flex xs12 md6>
                      <v-text-field v-model="workloadData.propValues.zeropadding" label="zeropadding" type="number" :min="0" :rules="minusRules" mask="########" />
                    </v-flex>
                    <!--latency-->
                    <v-flex xs12 md12>
                      <v-combobox v-model="workloadData.propValues['hdrhistogram.percentiles']" :items="latency" label="latency" chips clearable multiple />
                    </v-flex>

                  </v-layout>
                </v-container>
              </v-form>
            </v-card>
          </v-tab-item>
        </v-tabs>
        <!--/tab-3. 기타설정-->

        <v-flex xs12>
          <v-card-actions>
            <v-btn flat class="mx-3 font-weight" @click="onCancel()">Cancel</v-btn>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="onSave()" :disabled="!valid">Save</v-btn>
          </v-card-actions>
        </v-flex>

      </v-form>
    </v-card>
  </transition>
</ValidationObserver>
</template>


      <script>

      import { ValidationObserver } from "vee-validate";
      import VTextFieldWithValidation from './inputs/VTextFieldWithValidation';
      import VSelectWithValidation from './inputs/VSelectWithValidation';


      export default {
        props : ['settingBoxSeen', 'isDialog'],
        components: {
          ValidationObserver,
        },
        data: () => ({
          valid:true,
          minusRules: [
            v => /.+/.test(v) || '숫자만 입력이 가능합니다.'
          ],
          nameRules: [
            v => !!v || 'Name is required'
          ],
          operSizeRules: [
            v => v < 101  || '총 합이 100을 초과하였습니다.'
          ],
          operSaveRules: [
            v => v == 100  || '총 합은 100이 되어야 합니다.'
          ],
          selected: [],
          active : 'tab-1',
          dialog: false,
          slider: null,
          fileSizeValid: true,
          fileSizeModel: null,
          fileSize: ['GB', 'MB', 'KB'],
          trueFalse: ['true', 'false'],
          tab2ReadShow: false,
          tab2InsertShow: false,
          tab2ScanShow: false,
          distribution: ['uniform', 'zipfian', 'hotspot', 'sequential', 'exponential ', 'latest'],
          insertOrder: ['ordered', 'hashed'],
          histogram: ['hdrhistogram', 'histogram', 'timeseries'],
          latency: ['95', '99', '99.9', '99.99', '99.999', ],

        }),


        computed : {
          workloadData() {
              if(this.isDialog)
                return this.$store.state.insertWorkload
              else
                return this.$store.state.selectedWorkload
          },

          calculateTotal() {
            //string으로 인식되지 않도록 Float으로 파싱
            this.workloadData.propValues.readproportion = parseFloat(this.workloadData.propValues.readproportion)
            this.workloadData.propValues.updateproportion = parseFloat(this.workloadData.propValues.updateproportion)
            this.workloadData.propValues.insertproportion = parseFloat(this.workloadData.propValues.insertproportion)
            this.workloadData.propValues.scanproportion = parseFloat(this.workloadData.propValues.scanproportion)
            this.workloadData.propValues.readmodifywriteproportion = parseFloat(this.workloadData.propValues.readmodifywriteproportion)
            return(
              this.workloadData.propValues.readproportion
              + this.workloadData.propValues.updateproportion
              + this.workloadData.propValues.insertproportion
              + this.workloadData.propValues.scanproportion
              + this.workloadData.propValues.readmodifywriteproportion)
          }
        },

        methods:{
          //워크로드 파일을 클릭할 때마다 첫번째 탭으로 이동
          onSelect(){
            // console.log(this.$refs.tabs)
            this.$refs.tabs.callSlider()
            this.active = `tab-1`
          },

          //워크로드 설정박스 close
          onCancel() {
            // this.$store.commit('setInsertWorkload')
            this.$emit('emitCancel',this.isDialog)
          },

          onSave() {
            // console.log()
            // console.log(valid);
            if(this.$refs.form.validate()){
                this.$emit('emitSave', this.isDialog)
            }
          },


        } //method 닫히는 곳
      }  //export default 닫히는 곳
      </script>


      <style lang="css" scoped>
      flex.v-label {
        font-size: 10px;
      }
      .v-card__text {
        padding: 2px;
        width: 100%;
      }
      .tab-fade-enter-active, {
         transition: .5s ease;
       }
       .tab-fade-leave-active{
         transition: .2s ease;
       }

      .tab-fade-enter, .tab-fade-leave-to{
       opacity: 0;
       }

       >>> .v-tabs__item--active{
         color : rgb(237, 141, 28);
         font-weight : bold;
      }

      </style>
