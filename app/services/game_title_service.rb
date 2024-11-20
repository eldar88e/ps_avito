class GameTitleService
  def self.call(raw_name, platform)
    if platform == 'PS5, PS4'
      two_platforms(raw_name)
    elsif platform.include?('PS5') # ps5
      ps5_platform(raw_name)
    else # ps4
      ps4_platform(raw_name)
    end
  end

  def self.two_platforms(raw_name)
    prefix = ' PS5 и PS4'
    if raw_name.downcase.include?('ps4')
      return raw_name if raw_name.downcase.include?('ps5')

      raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix
    elsif raw_name.downcase.include?('ps5')
      raw_name.sub('(PS5)', '').sub('PS5', '').strip[0..39] + prefix
    else
      raw_name.strip[0..39] + prefix
    end
  end

  def self.ps5_platform(raw_name)
    return raw_name if raw_name.downcase.include?('ps5')

    "#{raw_name.strip[0..45]} PS5"
  end

  def self.ps4_platform(raw_name)
    prefix_old = ' ps4 и ps5'
    return raw_name.strip[0..39] + prefix_old unless raw_name.downcase.include?('ps4')

    raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix_old
  end
end
