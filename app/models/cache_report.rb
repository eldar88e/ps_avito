class CacheReport
  include Mongoid::Document

  field :report_id, type: Integer
  field :store_id, type: Integer
  field :report, type: Hash
  field :fees, type: Hash

  index({ report_id: 1, store_id: 1 }, { unique: true })
end