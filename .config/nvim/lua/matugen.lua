 local M = {}

function M.setup()
  require('base16-colorscheme').setup({
    base00 = '#1b110d',
    base01 = '#281d18',
    base02 = '#332722',
    base03 = '#a68b80',
    base04 = '#dec0b4',
    base05 = '#f4ded6',
    base06 = '#f4ded6',
    base07 = '#f4ded6',
    base08 = '#ffb4ab',
    base09 = '#d6c959',
    base0A = '#feb696',
    base0B = '#ffb595',
    base0C = '#d6c959',
    base0D = '#ffb595',
    base0E = '#feb696',
    base0F = '#93000a',
  })

  local hi = function(group, opts)
    vim.api.nvim_set_hl(0, group, opts)
  end

  hi('TelescopeNormal',         { fg = '#f4ded6',          bg = '#1b110d' })
  hi('TelescopeBorder',         { fg = '#a68b80',             bg = '#1b110d' })
  hi('TelescopePromptNormal',   { fg = '#f4ded6',          bg = '#1b110d' })
  hi('TelescopePromptBorder',   { fg = '#a68b80',             bg = '#1b110d' })
  hi('TelescopePromptPrefix',   { fg = '#ffb595',             bg = '#1b110d' })
  hi('TelescopePromptCounter',  { fg = '#dec0b4',  bg = '#1b110d' })
  hi('TelescopePromptTitle',    { fg = '#1b110d',             bg = '#ffb595' })
  hi('TelescopePreviewTitle',   { fg = '#1b110d',             bg = '#feb696' })
  hi('TelescopeResultsTitle',   { fg = '#1b110d',             bg = '#d6c959' })
  hi('TelescopeSelection',      { fg = '#f4ded6',          bg = '#332722' })
  hi('TelescopeSelectionCaret', { fg = '#ffb595',             bg = '#332722' })
  hi('TelescopeMatching',       { fg = '#ffb595',             bold = true })
end

 -- Register a signal handler for SIGUSR1 (matugen updates)
 local signal = vim.uv.new_signal()
 signal:start(
   'sigusr1',
   vim.schedule_wrap(function()
     package.loaded['matugen'] = nil
     require('matugen').setup()
   end)
 )

 return M
