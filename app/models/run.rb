class Run < ApplicationRecord
  has_many :games

  def self.last_id
    last = last_run
    last && last.status != 'finish' ? last.id : set_new_id
  end

  def self.status
    last_run.status
  end

  def self.status=(new_status)
    last_run.update status: new_status.to_s
    new_status.to_s
  end

  def self.finish
    last_run.update status: 'finish'
  end

  def self.last_run
    last
  end

  def self.set_new_id
    create.id
  end
end
