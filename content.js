chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertToMarkdown") {
    try {
      const markdown = extractAndConvertToMarkdown();
      copyToClipboard(markdown);
      showNotification("記事をマークダウンでコピーしました");
    } catch (error) {
      console.error("エラーが発生しました:", error);
      showNotification("エラーが発生しました", true);
    }
  }
});

function extractAndConvertToMarkdown() {
  const article = document.querySelector('article') || document.querySelector('[role="article"]');
  
  if (!article) {
    throw new Error("記事が見つかりません");
  }

  const title = document.querySelector('h1')?.textContent?.trim() || "";
  const content = article.cloneNode(true);
  
  removeUnwantedElements(content);
  
  const markdown = convertToMarkdown(content);
  
  return title ? `# ${title}\n\n${markdown}` : markdown;
}

function removeUnwantedElements(element) {
  const selectorsToRemove = [
    'script',
    'style',
    'svg',
    '[class*="subscription"]',
    '[class*="purchase"]',
    '[class*="support"]',
    '[class*="like"]',
    '[class*="share"]',
    '[class*="comment"]'
  ];
  
  selectorsToRemove.forEach(selector => {
    element.querySelectorAll(selector).forEach(el => el.remove());
  });
}

function convertToMarkdown(element) {
  let markdown = "";
  
  function processNode(node, listLevel = 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, ' ');
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }
    
    const tagName = node.tagName.toLowerCase();
    let content = "";
    
    for (const child of node.childNodes) {
      content += processNode(child, listLevel);
    }
    
    content = content.trim();
    
    switch (tagName) {
      case 'h1':
        return `# ${content}\n\n`;
      case 'h2':
        return `## ${content}\n\n`;
      case 'h3':
        return `### ${content}\n\n`;
      case 'h4':
        return `#### ${content}\n\n`;
      case 'h5':
        return `##### ${content}\n\n`;
      case 'h6':
        return `###### ${content}\n\n`;
      case 'p':
        return content ? `${content}\n\n` : "";
      case 'br':
        return "\n";
      case 'strong':
      case 'b':
        return `**${content}**`;
      case 'em':
      case 'i':
        return `*${content}*`;
      case 'code':
        if (node.parentElement?.tagName.toLowerCase() === 'pre') {
          return content;
        }
        return `\`${content}\``;
      case 'pre':
        return `\`\`\`\n${content}\n\`\`\`\n\n`;
      case 'blockquote':
        return content.split('\n').map(line => `> ${line}`).join('\n') + "\n\n";
      case 'a':
        const href = node.getAttribute('href');
        return href ? `[${content}](${href})` : content;
      case 'img':
        const src = node.getAttribute('src');
        const alt = node.getAttribute('alt') || "";
        return src ? `![${alt}](${src})\n\n` : "";
      case 'ul':
        return content + "\n";
      case 'ol':
        return content + "\n";
      case 'li':
        const prefix = node.parentElement?.tagName.toLowerCase() === 'ol' 
          ? `${Array.from(node.parentElement.children).indexOf(node) + 1}. `
          : '- ';
        return '  '.repeat(listLevel) + prefix + content + "\n";
      case 'hr':
        return "---\n\n";
      case 'figure':
      case 'figcaption':
      case 'picture':
        return content ? `${content}\n\n` : "";
      default:
        return content;
    }
  }
  
  markdown = processNode(element);
  
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background-color: ${isError ? '#f44336' : '#4CAF50'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    font-family: sans-serif;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}