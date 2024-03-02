class FtpService
  def initialize(site)
    @name = "top_1000_#{site}.xlsx"
  end

  def send_file
    Net::FTP.open(FTP_HOST, FTP_LOGIN, FTP_PASS) do |ftp|
      ftp.chdir('/assets')
      ftp.putbinaryfile(@name)
    end
  rescue => e
    Rails.logger.error e.message
    TelegramService.new("Excel file was not sent!\nError: #{e.message}").report
  end
end
