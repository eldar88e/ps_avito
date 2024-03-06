class FtpService
  def initialize(name)
    @name = name
  end

  def send_file
    Net::FTP.open(FTP_HOST, FTP_LOGIN, FTP_PASS) do |ftp|
      ftp.chdir('/assets')
      ftp.putbinaryfile(@name)
    end

    true
  rescue => e
    Rails.logger.error e.message
    TelegramService.new("❌ Excel file was not sent!\nError: #{e.message}").report
  end
end
