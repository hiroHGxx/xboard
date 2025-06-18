/**
 * XBoard iframe 埋め込みヘルパー
 * 
 * 使用方法:
 * <script src="https://your-domain.com/iframe-helper.js"></script>
 * <script>
 *   XBoardIframe.create('#container', {
 *     accounts: 'elonmusk',
 *     limit: 5
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  var XBoardIframe = {
    /**
     * iframe埋め込みウィジェットを作成
     * @param {string|HTMLElement} container - コンテナ要素またはセレクタ
     * @param {Object} options - 設定オプション
     * @returns {Object} - iframe制御オブジェクト
     */
    create: function(container, options) {
      options = options || {};
      
      // コンテナ要素の取得
      var containerElement;
      if (typeof container === 'string') {
        containerElement = document.querySelector(container);
        if (!containerElement) {
          throw new Error('Container element not found: ' + container);
        }
      } else {
        containerElement = container;
      }

      // デフォルトオプション
      var defaultOptions = {
        accounts: 'elonmusk,twitter',
        limit: 6,
        theme: 'auto',
        layout: 'grid',
        maxColumns: 2,
        refreshInterval: 30000,
        baseUrl: window.location.origin
      };

      var config = this._mergeOptions(defaultOptions, options);
      
      // iframe作成
      var iframe = this._createIframe(config);
      
      // コンテナに追加
      containerElement.appendChild(iframe);

      // 制御オブジェクト
      var controller = {
        iframe: iframe,
        container: containerElement,
        options: config,
        
        // オプション更新
        updateOptions: function(newOptions) {
          config = XBoardIframe._mergeOptions(config, newOptions);
          iframe.contentWindow.postMessage({
            type: 'xboard-update-options',
            options: newOptions
          }, '*');
        },
        
        // 手動更新
        refresh: function() {
          iframe.contentWindow.postMessage({
            type: 'xboard-refresh'
          }, '*');
        },
        
        // 破棄
        destroy: function() {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        },
        
        // サイズ設定
        setSize: function(width, height) {
          if (width) iframe.style.width = width + 'px';
          if (height) iframe.style.height = height + 'px';
        }
      };

      return controller;
    },

    /**
     * iframe要素を作成
     * @private
     */
    _createIframe: function(options) {
      var iframe = document.createElement('iframe');
      
      // iframe属性設定
      iframe.src = this._buildIframeUrl(options);
      iframe.style.width = '100%';
      iframe.style.height = '400px'; // 初期高さ
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('title', 'XBoard Timeline Widget');

      // 自動リサイズ機能
      this._setupAutoResize(iframe);

      return iframe;
    },

    /**
     * iframe URLを構築
     * @private
     */
    _buildIframeUrl: function(options) {
      var params = new URLSearchParams();
      
      if (options.accounts) params.set('accounts', options.accounts);
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.theme) params.set('theme', options.theme);
      if (options.layout) params.set('layout', options.layout);
      if (options.maxColumns) params.set('maxColumns', options.maxColumns.toString());
      if (options.refreshInterval) params.set('refreshInterval', options.refreshInterval.toString());

      return options.baseUrl + '/iframe-embed.html?' + params.toString();
    },

    /**
     * 自動リサイズを設定
     * @private
     */
    _setupAutoResize: function(iframe) {
      var resizeHandler = function(event) {
        // 同一オリジンまたは信頼できるオリジンからのメッセージのみ処理
        if (event.source !== iframe.contentWindow) {
          return;
        }

        if (event.data.type === 'xboard-resize') {
          var newHeight = Math.max(event.data.height || 400, 200);
          iframe.style.height = newHeight + 'px';
          
          // カスタムイベント発火
          var resizeEvent = new CustomEvent('xboard-resized', {
            detail: {
              width: event.data.width,
              height: newHeight,
              iframe: iframe
            }
          });
          window.dispatchEvent(resizeEvent);
        } else if (event.data.type === 'xboard-loaded') {
          // 読み込み完了イベント
          var loadEvent = new CustomEvent('xboard-loaded', {
            detail: {
              iframe: iframe
            }
          });
          window.dispatchEvent(loadEvent);
        }
      };

      window.addEventListener('message', resizeHandler);
      
      // iframe削除時にイベントリスナーもクリーンアップ
      var originalRemoveChild = iframe.parentNode ? iframe.parentNode.removeChild : null;
      if (originalRemoveChild) {
        iframe.parentNode.removeChild = function(child) {
          if (child === iframe) {
            window.removeEventListener('message', resizeHandler);
          }
          return originalRemoveChild.call(this, child);
        };
      }
    },

    /**
     * オプションをマージ
     * @private
     */
    _mergeOptions: function(defaults, options) {
      var result = {};
      for (var key in defaults) {
        result[key] = defaults[key];
      }
      for (var key in options) {
        if (options[key] !== undefined) {
          result[key] = options[key];
        }
      }
      return result;
    },

    /**
     * データ属性から自動初期化
     */
    autoInit: function() {
      var elements = document.querySelectorAll('[data-xboard-iframe]');
      
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var dataset = element.dataset;
        
        var options = {};
        if (dataset.accounts) options.accounts = dataset.accounts;
        if (dataset.limit) options.limit = parseInt(dataset.limit);
        if (dataset.theme) options.theme = dataset.theme;
        if (dataset.layout) options.layout = dataset.layout;
        if (dataset.maxColumns) options.maxColumns = parseInt(dataset.maxColumns);
        if (dataset.refreshInterval) options.refreshInterval = parseInt(dataset.refreshInterval);
        if (dataset.baseUrl) options.baseUrl = dataset.baseUrl;

        this.create(element, options);
      }
    }
  };

  // グローバルに公開
  window.XBoardIframe = XBoardIframe;

  // DOM読み込み完了後に自動初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      XBoardIframe.autoInit();
    });
  } else {
    XBoardIframe.autoInit();
  }

})(window);