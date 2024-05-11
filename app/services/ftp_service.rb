class FtpService
  def initialize(name)
    @name = name
  end

  def send_file
    Net::FTP.open(FTP_HOST, FTP_LOGIN, FTP_PASS) do |ftp|
      ftp.chdir('/assets')
      ftp.putbinaryfile(@name)
    end
    TelegramService.new("✅ File #{@name} is updated!").report
  rescue => e
    Rails.logger.error e.message
    TelegramService.new("❌ File #{@name} was not sent!\nError: #{e.message}").report
  end
end
