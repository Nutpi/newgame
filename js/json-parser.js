// 智能JSON解析器类
class JsonParser {
  constructor() {
    // 可以添加配置选项
    this.options = {
      enableEval: true,  // 是否允许安全eval作为最后手段
      enableDebug: true  // 是否启用调试日志
    };
  }

  // 主要的智能解析方法
  parse(input) {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      throw new Error('输入内容为空');
    }

    // 第一步：尝试原生 JSON.parse()
    try {
      const result = JSON.parse(trimmedInput);
      this.log('原生JSON.parse成功');
      return result;
    } catch (originalError) {
      this.log('原生JSON.parse失败，尝试智能预处理...', originalError.message);
    }

    // 第二步：智能预处理
    try {
      const preprocessed = this.preprocess(trimmedInput);
      this.log('预处理结果:', preprocessed);
      const result = JSON.parse(preprocessed);
      this.log('预处理后JSON.parse成功');
      return result;
    } catch (preprocessError) {
      this.log('预处理后仍然失败...', preprocessError.message);
      
      // 第三步：深度清理
      try {
        const deepCleaned = this.deepClean(trimmedInput);
        this.log('深度清理结果:', deepCleaned);
        const result = JSON.parse(deepCleaned);
        this.log('深度清理后JSON.parse成功');
        return result;
      } catch (finalError) {
        this.log('深度清理后仍然失败...', finalError.message);
        
        // 第四步：安全eval（可选）
        if (this.options.enableEval) {
          try {
            const evalResult = this.safeEval(trimmedInput);
            this.log('安全eval成功');
            return evalResult;
          } catch (evalError) {
            this.log('安全eval也失败...', evalError.message);
          }
        }
        
        // 抛出详细错误信息
        throw new Error(`JSON解析失败。
原始错误: ${finalError.message}
建议检查：
1. 字符串是否使用双引号包围
2. 属性名是否加了引号  
3. 是否有多余的逗号
4. 括号是否匹配
5. 是否包含JavaScript语法（如函数、undefined等）`);
      }
    }
  }

  // 预处理JSON字符串
  preprocess(str) {
    let result = str.trim();
    
    // 检查基本有效性
    if (!result || result.length < 2) {
      throw new Error('输入内容过短或为空');
    }

    // 移除BOM标记
    result = result.replace(/^\uFEFF/, '');
    
    // 移除注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, ''); // 多行注释
    result = result.replace(/(?:^|[^\\])\/\/.*$/gm, ''); // 单行注释
    
    // 移除多余空白但保留结构
    result = result.replace(/\s+/g, ' ').trim();
    
    // 确保有效的开始字符
    if (!result.startsWith('{') && !result.startsWith('[')) {
      throw new Error('JSON必须以 { 或 [ 开始');
    }
    
    // 智能处理单引号
    result = this.replaceSingleQuotes(result);
    
    // 移除尾随逗号
    result = this.removeTrailingCommas(result);
    
    // 为属性名添加引号
    result = this.addQuotesToKeys(result);
    
    return result;
  }

  // 单引号替换
  replaceSingleQuotes(str) {
    let result = '';
    let inDoubleQuotes = false;
    let inSingleQuotes = false;
    let escaped = false;
    let i = 0;
    
    while (i < str.length) {
      const char = str[i];
      
      if (escaped) {
        result += char;
        escaped = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        result += char;
        i++;
        continue;
      }
      
      if (char === '"' && !inSingleQuotes) {
        inDoubleQuotes = !inDoubleQuotes;
        result += char;
      } else if (char === "'" && !inDoubleQuotes) {
        if (this.isSingleQuoteStringBoundary(str, i, inSingleQuotes)) {
          inSingleQuotes = !inSingleQuotes;
          result += '"'; // 替换为双引号
        } else {
          result += char;
        }
      } else {
        result += char;
      }
      
      i++;
    }
    
    return result;
  }

  // 判断单引号是否为字符串边界
  isSingleQuoteStringBoundary(str, index, currentlyInSingleQuotes) {
    if (currentlyInSingleQuotes) {
      // 检查是否为结束引号
      for (let i = index + 1; i < str.length; i++) {
        const nextChar = str[i];
        if (nextChar === ' ' || nextChar === '\t' || nextChar === '\n' || nextChar === '\r') {
          continue;
        }
        return nextChar === ',' || nextChar === ':' || nextChar === '}' || nextChar === ']';
      }
      return true;
    } else {
      // 检查是否为开始引号
      for (let i = index - 1; i >= 0; i--) {
        const prevChar = str[i];
        if (prevChar === ' ' || prevChar === '\t' || prevChar === '\n' || prevChar === '\r') {
          continue;
        }
        return prevChar === ':' || prevChar === '{' || prevChar === '[' || prevChar === ',';
      }
      return true;
    }
  }

  // 移除尾随逗号
  removeTrailingCommas(str) {
    return str.replace(/,(\s*[}\]])/g, '$1');
  }

  // 为属性名添加引号
  addQuotesToKeys(str) {
    let result = '';
    let inString = false;
    let stringChar = '';
    let escaped = false;
    let i = 0;
    
    while (i < str.length) {
      const char = str[i];
      
      if (escaped) {
        result += char;
        escaped = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        result += char;
        i++;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        result += char;
      } else if (char === stringChar && inString) {
        inString = false;
        stringChar = '';
        result += char;
      } else if (!inString && /[a-zA-Z_$]/.test(char)) {
        // 可能是不带引号的属性名
        const keyMatch = str.substring(i).match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
        if (keyMatch) {
          const beforeKey = result.trim();
          if (beforeKey.endsWith('{') || beforeKey.endsWith(',')) {
            result += `"${keyMatch[1]}":`;
            i += keyMatch[0].length - 1;
          } else {
            result += char;
          }
        } else {
          result += char;
        }
      } else {
        result += char;
      }
      
      i++;
    }
    
    return result;
  }

  // 深度清理
  deepClean(str) {
    let result = str.trim();
    
    // 移除特殊字符
    result = result.replace(/^\uFEFF/, '');
    result = result.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // 移除注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/(?:^|[^\\])\/\/.*$/gm, '');
    
    // 处理JavaScript特有语法
    result = result.replace(/\bundefined\b/g, 'null');
    result = result.replace(/\bNaN\b/g, 'null');
    result = result.replace(/\bInfinity\b/g, 'null');
    result = result.replace(/\b-Infinity\b/g, 'null');
    
    // 移除函数定义
    result = result.replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, 'null');
    
    // 处理日期对象
    result = result.replace(/new\s+Date\s*\([^)]*\)/g, '"1970-01-01T00:00:00.000Z"');
    
    // 应用其他处理
    result = this.removeTrailingCommas(result);
    result = this.replaceSingleQuotes(result);
    result = this.addQuotesToKeys(result);
    
    // 最后清理
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
  }

  // 安全eval
  safeEval(str) {
    const cleanStr = str.trim();
    
    // 安全检查
    const dangerousPatterns = [
      'function', 'eval', 'setTimeout', 'setInterval',
      'require', 'import', 'document', 'window',
      'process', 'global', '__proto__', 'constructor'
    ];
    
    for (const pattern of dangerousPatterns) {
      if (cleanStr.includes(pattern)) {
        throw new Error(`包含不安全的代码: ${pattern}`);
      }
    }
    
    try {
      const func = new Function('return (' + cleanStr + ')');
      const result = func();
      
      // 确保结果可序列化
      JSON.stringify(result);
      
      return result;
    } catch (error) {
      throw new Error('安全eval失败: ' + error.message);
    }
  }

  // 调试日志
  log(...args) {
    if (this.options.enableDebug) {
      console.log('[JsonParser]', ...args);
    }
  }

  // 设置选项
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
}

// 导出到全局
window.JsonParser = JsonParser; 