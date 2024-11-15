class FtpService
  def initialize(name, user)
    @name = name
    @user = user
  end

  def self.call(name, user)
    new(name, user).send_file
  end

  def send_file
    Net::FTP.open(FTP_HOST, FTP_LOGIN, FTP_PASS) do |ftp|
      ftp.chdir('/assets')
      ftp.putbinaryfile(@name)
    end
    TelegramService.call(@user, "✅ File #{@name} is updated!")
  rescue StandardError => e
    Rails.logger.error e.message
    TelegramService.call(@user, "❌ File #{@name} was not sent!\nError: #{e.message}")
  end
end
