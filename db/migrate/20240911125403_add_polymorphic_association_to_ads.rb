class AddPolymorphicAssociationToAds < ActiveRecord::Migration[7.1]
  def change
    add_reference :ads, :adable, polymorphic: true, null: false
  end
end
