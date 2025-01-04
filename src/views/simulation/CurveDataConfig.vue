<template>
  <el-dialog
    v-dialog-drag
    title="曲线值配置界面"
    :visible.sync="localVisible"
    width="50%"
    :modal="false"
    @close="handleClose"
  >
    <el-form ref="curveForm" label-width="100px">
      <el-row :gutter="20" class="time-config-row">
        <el-col :span="8">
          <el-form-item label="从">
            <el-time-picker
              v-model="startTime"
              placeholder="开始时间"
              value-format="HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="到">
            <el-time-picker
              v-model="endTime"
              placeholder="结束时间"
              value-format="HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="间隔">
            <el-input
              v-model="interval"
              placeholder="时间间隔(分钟)"
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="2" class="generate-btn">
          <el-button type="primary" size="small" @click="generateCurveData">
            自动新建
          </el-button>
        </el-col>
      </el-row>

      <el-table :data="localCurveData" style="width: 100%">
        <el-table-column label="时间" prop="time" width="150">
          <template slot-scope="scope">
            <el-input v-model="scope.row.time" placeholder="时间" />
          </template>
        </el-table-column>
        <el-table-column label="值" prop="value" width="150">
          <template slot-scope="scope">
            <el-input v-model="scope.row.value" placeholder="值" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="removeRow(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="add-row-btn">
        <el-button type="primary" size="small" @click="addEmptyRow">
          新增
        </el-button>
      </div>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "CurveDataConfig",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    parameter: {
      type: Object,
      default: () => ({
        value: [],
      }),
    },
  },
  data() {
    return {
      localVisible: this.visible,
      startTime: "",
      endTime: "",
      interval: "",
      localCurveData: [],
    };
  },
  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        this.localVisible = newVal;
      },
    },
    parameter: {
      immediate: true,
      handler(newVal) {
        if (newVal && Array.isArray(newVal.value)) {
          this.localCurveData = [...newVal.value]; // 拷贝一份，不直接修改 props
        } else {
          this.localCurveData = [];
        }
      },
    },
  },
  methods: {
    generateCurveData() {
      if (!this.startTime || !this.endTime || !this.interval) {
        this.$message.error("请填写完整的时间段和间隔时间");
        return;
      }

      const startTime = this.parseTime(this.startTime);
      const endTime = this.parseTime(this.endTime);
      const interval = parseInt(this.interval, 10);

      let currentTime = startTime;
      const existingTimes = this.localCurveData.map((item) => item.time);

      while (currentTime <= endTime) {
        const formattedTime = this.formatTime(currentTime);
        if (!existingTimes.includes(formattedTime)) {
          this.localCurveData.push({
            time: formattedTime,
            value: "",
          });
        }
        currentTime += interval;
      }
    },

    parseTime(time) {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    },

    formatTime(totalMinutes) {
      const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const minutes = String(totalMinutes % 60).padStart(2, "0");
      return `${hours}:${minutes}`;
    },

    addEmptyRow() {
      this.localCurveData.push({ time: "", value: "" });
    },
    removeRow(index) {
      this.localCurveData.splice(index, 1);
    },
    handleClose() {
      this.localVisible = false;
      this.$emit("update:visible", false);
    },
    handleConfirm() {
      this.$emit("update-curve-data", this.localCurveData);
      this.handleClose();
    },
  },
};
</script>
