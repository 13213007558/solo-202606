export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PaletteInput {
  name: string;
  author: string;
  colors: string[];
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function validatePalette(input: PaletteInput): ValidationResult {
  const errors: string[] = [];

  if (!input.name || input.name.length < 2 || input.name.length > 30) {
    errors.push('方案名称长度必须在2-30字符之间');
  }

  if (!input.author || input.author.trim().length === 0) {
    errors.push('作者昵称不能为空');
  }

  if (!Array.isArray(input.colors)) {
    errors.push('颜色数据格式错误');
    return { valid: false, errors };
  }

  if (input.colors.length < 6) {
    errors.push('颜色数量不能少于6种');
  }

  if (input.colors.length > 12) {
    errors.push('颜色数量不能超过12种');
  }

  input.colors.forEach((color, index) => {
    if (!HEX_COLOR_REGEX.test(color)) {
      errors.push(`第${index + 1}个颜色格式错误，必须为6位十六进制格式（如#FF5733）`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
