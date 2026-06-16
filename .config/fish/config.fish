if status is-interactive
    # Commands to run in interactive sessions can go here
end
zoxide init fish | source
#direnv hook fish | source
fish_add_path /home/fed/Downloads/develop/flutter/bin
set -x FLUTTER_ROOT /home/fed/Downloads/develop/flutter
#set -x CHROME_EXECUTABLE /run/current-system/sw/bin/google-chrome-stable
