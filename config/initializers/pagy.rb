require 'pagy/extras/bootstrap'
require 'pagy/extras/overflow'
require 'pagy/extras/i18n'
# require 'pagy/extras/pagy'

Pagy::DEFAULT[:overflow] = :empty_page # :last_page
Pagy::DEFAULT[:items] = 36 # items per page
Pagy::DEFAULT[:size]  = [1, 2, 2, 1]  # nav bar links

Pagy::DEFAULT[:steps] = { 0 => 5, 540 => 7, 720 => 9 }
