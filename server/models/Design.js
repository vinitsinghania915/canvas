const mongoose = require("mongoose");

const designSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    canvas: {
      width: {
        type: Number,
        default: 1080,
      },
      height: {
        type: Number,
        default: 1080,
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
    },
    objects: [
      {
        id: String,
        type: {
          type: String,
          enum: ["text", "image", "rectangle", "circle", "i-text"],
        },
        left: Number,
        top: Number,
        width: Number,
        height: Number,
        angle: {
          type: Number,
          default: 0,
        },
        scaleX: {
          type: Number,
          default: 1,
        },
        scaleY: {
          type: Number,
          default: 1,
        },
        zIndex: {
          type: Number,
          default: 0,
        },
        // Text specific properties
        text: String,
        fontSize: Number,
        fontFamily: String,
        fill: String,
        // Image specific properties
        src: String,
        // Shape specific properties
        fill: String,
        stroke: String,
        strokeWidth: Number,
        rx: Number, // for rounded rectangles
        ry: Number, // for rounded rectangles
      },
    ],
    thumbnail: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["viewer", "editor"],
          default: "editor",
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
designSchema.index({ owner: 1, createdAt: -1 });
designSchema.index({ "collaborators.user": 1 });

module.exports = mongoose.model("Design", designSchema);
