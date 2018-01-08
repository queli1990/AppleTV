var ErrorAlertTemplate = function (title) {
  return `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${'press Ok to reload'}</description>
        <button>
          <title>OK</title>
        </button>
      </alertTemplate>
    </document>`
}
