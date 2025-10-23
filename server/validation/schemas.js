const { z } = require("zod");

// User validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// Design validation schemas
const createDesignSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  canvas: z
    .object({
      width: z.number().positive().default(1080),
      height: z.number().positive().default(1080),
      backgroundColor: z.string().default("#ffffff"),
    })
    .optional(),
});

const updateDesignSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  canvas: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
      backgroundColor: z.string(),
    })
    .optional(),
  objects: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["text", "image", "rectangle", "circle", "i-text"]),
        left: z.number(),
        top: z.number(),
        width: z.number(),
        height: z.number(),
        angle: z.number().default(0),
        scaleX: z.number().default(1),
        scaleY: z.number().default(1),
        zIndex: z.number().default(0),
        // Text properties
        text: z.string().optional(),
        fontSize: z.number().optional(),
        fontFamily: z.string().optional(),
        fill: z.string().optional(),
        // Image properties
        src: z.string().optional(),
        // Shape properties
        stroke: z.string().optional(),
        strokeWidth: z.number().optional(),
        rx: z.number().optional(),
        ry: z.number().optional(),
      })
    )
    .optional(),
});

// Comment validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  mentions: z.array(z.string()).optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000).trim().optional(),
  isResolved: z.boolean().optional(),
});

const addReplySchema = z.object({
  content: z.string().min(1).max(500).trim(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createDesignSchema,
  updateDesignSchema,
  createCommentSchema,
  updateCommentSchema,
  addReplySchema,
};
